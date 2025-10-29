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

// Funções para interagir com o Supabase - MODO OFFLINE
export const supabaseService = {
  // Buscar todas as autoridades - OFFLINE
  async buscarAutoridades(): Promise<AutoridadeDB[]> {
    console.log('🔄 Modo offline: retornando array vazio para busca')
    return []
  },

  // Inserir nova autoridade - OFFLINE
  async inserirAutoridade(autoridade: Omit<AutoridadeDB, 'id' | 'created_at' | 'updated_at'>): Promise<AutoridadeDB | null> {
    console.log('💾 Modo offline: autoridade salva apenas localmente')
    return null
  },

  // Atualizar autoridade - OFFLINE
  async atualizarAutoridade(id: string, autoridade: Partial<AutoridadeDB>): Promise<AutoridadeDB | null> {
    console.log('💾 Modo offline: atualização salva apenas localmente')
    return null
  },

  // Deletar autoridade - OFFLINE
  async deletarAutoridade(id: string): Promise<boolean> {
    console.log('💾 Modo offline: deleção salva apenas localmente')
    return true
  },

  // Sincronizar múltiplas autoridades - OFFLINE
  async sincronizarAutoridades(autoridades: AutoridadeDB[]): Promise<boolean> {
    console.log('💾 Modo offline: sincronização desabilitada')
    return false
  },

  // Verificar conexão - SEMPRE OFFLINE
  async verificarConexao(): Promise<boolean> {
    console.log('🔌 Modo offline: conexão desabilitada')
    return false
  }
}