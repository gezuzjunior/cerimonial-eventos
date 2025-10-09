import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface AutoridadeDB {
  id: string
  nome: string
  cargo: string
  orgao: string
  nivel_federativo: 'Federal' | 'Estadual' | 'Municipal'
  precedencia: number
  presente: boolean
  incluir_dispositivo: boolean
  incluir_falas: boolean
  ordem_fala: number
  created_at?: string
  updated_at?: string
}

// Funções para interagir com o banco
export const autoridadesService = {
  // Buscar todas as autoridades
  async getAll() {
    const { data, error } = await supabase
      .from('autoridades')
      .select('*')
      .order('precedencia', { ascending: true })
    
    if (error) throw error
    return data as AutoridadeDB[]
  },

  // Criar nova autoridade
  async create(autoridade: Omit<AutoridadeDB, 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('autoridades')
      .insert([autoridade])
      .select()
      .single()
    
    if (error) throw error
    return data as AutoridadeDB
  },

  // Atualizar autoridade
  async update(id: string, updates: Partial<AutoridadeDB>) {
    const { data, error } = await supabase
      .from('autoridades')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as AutoridadeDB
  },

  // Deletar autoridade
  async delete(id: string) {
    const { error } = await supabase
      .from('autoridades')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Atualizar múltiplas autoridades (para reordenação)
  async updateMultiple(autoridades: { id: string; updates: Partial<AutoridadeDB> }[]) {
    const promises = autoridades.map(({ id, updates }) =>
      supabase
        .from('autoridades')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
    )
    
    const results = await Promise.all(promises)
    const errors = results.filter(result => result.error)
    
    if (errors.length > 0) {
      throw new Error(`Erro ao atualizar autoridades: ${errors.map(e => e.error?.message).join(', ')}`)
    }
  }
}