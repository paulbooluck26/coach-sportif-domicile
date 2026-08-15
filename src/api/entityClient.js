import { supabase } from './supabaseClient';
import { tableNameFor } from './entityTables';

// Reproduit la forme du SDK Base44 (base44.entities.X.method(...)) mais
// interroge directement Supabase/Postgres. Objectif : ne toucher à AUCUN
// des 57 fichiers qui font déjà `base44.entities.X.filter(...)` etc.
//
// Méthodes couvertes (recensées dans le code existant) :
//   list(), filter(query), get(id), create(data), update(id, data),
//   delete(id), bulkCreate(dataArray)

function throwIfError({ data, error }) {
  if (error) {
    throw new Error(`[${error.code || 'supabase'}] ${error.message}`);
  }
  return data;
}

function createEntityClient(entityName) {
  const table = tableNameFor(entityName);

  return {
    async list(orderBy = '-created_date') {
      let query = supabase.from(table).select('*');
      query = applyOrder(query, orderBy);
      const { data, error } = await query;
      return throwIfError({ data, error });
    },

    async filter(match = {}, orderBy = '-created_date') {
      let query = supabase.from(table).select('*').match(match);
      query = applyOrder(query, orderBy);
      const { data, error } = await query;
      return throwIfError({ data, error });
    },

    async get(id) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      return throwIfError({ data, error });
    },

    async create(payload) {
      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select()
        .single();
      return throwIfError({ data, error });
    },

    async bulkCreate(payloadArray) {
      const { data, error } = await supabase
        .from(table)
        .insert(payloadArray)
        .select();
      return throwIfError({ data, error });
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(table)
        .update({ ...payload, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      return throwIfError({ data, error });
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw new Error(`[${error.code || 'supabase'}] ${error.message}`);
      return { success: true };
    },

    // Pas d'équivalent SQL natif pour "mettre à jour plusieurs lignes avec
    // des valeurs différentes chacune" en un seul appel — on boucle sur
    // update() individuellement. Suffisant pour nos volumes (quelques
    // dizaines de lignes, ex: réordonner des exercices).
    async bulkUpdate(items) {
      const results = [];
      for (const item of items) {
        const { id, ...payload } = item;
        results.push(await this.update(id, payload));
      }
      return results;
    },
  };
}

// Base44 utilise la convention `"-champ"` pour un tri descendant.
function applyOrder(query, orderBy) {
  if (!orderBy) return query;
  const descending = orderBy.startsWith('-');
  const column = descending ? orderBy.slice(1) : orderBy;
  return query.order(column, { ascending: !descending });
}

export function buildEntities(entityNames) {
  const entities = {};
  for (const name of entityNames) {
    entities[name] = createEntityClient(name);
  }
  return entities;
}
