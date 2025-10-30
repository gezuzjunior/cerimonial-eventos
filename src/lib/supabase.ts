import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

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

// Funções para interagir com o Supabase - MODO ONLINE
export const supabaseService = {
  // Buscar todas as autoridades
  async buscarAutoridades(): Promise<AutoridadeDB[]> {
    try {
      const { data, error } = await supabase
        .from('autoridades')
        .select('*')
        .order('precedencia', { ascending: true })

      if (error) {
        console.error('Erro ao buscar autoridades:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro na conexão:', error)
      return []
    }
  },

  // Inserir nova autoridade
  async inserirAutoridade(autoridade: Omit<AutoridadeDB, 'id' | 'created_at' | 'updated_at'>): Promise<AutoridadeDB | null> {
    try {
      const { data, error } = await supabase
        .from('autoridades')
        .insert([autoridade])
        .select()
        .single()

      if (error) {
        console.error('Erro ao inserir autoridade:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro na conexão:', error)
      return null
    }
  },

  // Atualizar autoridade
  async atualizarAutoridade(id: string, autoridade: Partial<AutoridadeDB>): Promise<AutoridadeDB | null> {
    try {
      const { data, error } = await supabase
        .from('autoridades')
        .update(autoridade)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar autoridade:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro na conexão:', error)
      return null
    }
  },

  // Deletar autoridade
  async deletarAutoridade(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('autoridades')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar autoridade:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro na conexão:', error)
      return false
    }
  },

  // Sincronizar múltiplas autoridades
  async sincronizarAutoridades(autoridades: AutoridadeDB[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('autoridades')
        .upsert(autoridades, { onConflict: 'id' })

      if (error) {
        console.error('Erro ao sincronizar autoridades:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro na conexão:', error)
      return false
    }
  },

  // Verificar conexão
  async verificarConexao(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('autoridades')
        .select('count', { count: 'exact', head: true })

      if (error) {
        console.error('Erro na verificação de conexão:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro na conexão:', error)
      return false
    }
  }
}