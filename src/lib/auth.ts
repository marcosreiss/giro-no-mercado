import { supabase } from './supabse'
import bcrypt from 'bcryptjs'
import Cookies from 'js-cookie'

export interface Usuario {
  id: string
  username: string
  nome_completo: string
  tipo_usuario: 'cliente' | 'comerciante' | 'entregador'
  password_hash: string
  ativo: boolean
  ultimo_login: string | null
  criado_em: string
}

export interface User {
  id: string
  username: string
  nome_completo: string
  tipo_usuario: 'cliente' | 'comerciante' | 'entregador'
}

// Login com username e senha
export async function login(username: string, password: string, lembrarMe: boolean = false): Promise<User> {
  try {
    // Buscar usuário
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', username)
      .eq('ativo', true)
      .single()

    if (error || !usuario) {
      throw new Error('Usuário não encontrado')
    }

    const usuarioData = usuario as Usuario

    // Verificar senha
    const senhaValida = await bcrypt.compare(password, usuarioData.password_hash)
    
    if (!senhaValida) {
      throw new Error('Senha incorreta')
    }

    // Atualizar último login
    await supabase
      .from('usuarios')
      .update({ ultimo_login: new Date().toISOString() })
      .eq('id', usuarioData.id)

    // Criar sessão se "lembrar-me"
    let token = null
    if (lembrarMe) {
      token = crypto.randomUUID()
      const expiraEm = new Date()
      expiraEm.setDate(expiraEm.getDate() + 30) // 30 dias

      await supabase
        .from('sessoes')
        .insert({
          usuario_id: usuarioData.id,
          token,
          expira_em: expiraEm.toISOString()
        })

      // Salvar token no cookie
      Cookies.set('session_token', token, { expires: 30, secure: true, sameSite: 'strict' })
    }

    // Salvar usuário no localStorage (sessão atual)
    const user: User = {
      id: usuarioData.id,
      username: usuarioData.username,
      nome_completo: usuarioData.nome_completo,
      tipo_usuario: usuarioData.tipo_usuario
    }
    
    localStorage.setItem('user', JSON.stringify(user))

    return user
  } catch (error) {
    console.error('Erro no login:', error)
    throw error
  }
}

// Verificar sessão salva (lembrar-me)
export async function verificarSessao(): Promise<User | null> {
  const token = Cookies.get('session_token')
  
  if (!token) return null

  try {
    const { data: sessao, error } = await supabase
      .from('sessoes')
      .select('usuario_id, expira_em, usuarios(*)')
      .eq('token', token)
      .single()

    if (error || !sessao) {
      Cookies.remove('session_token')
      return null
    }

    // Verificar se expirou
    if (new Date(sessao.expira_em) < new Date()) {
      await supabase.from('sessoes').delete().eq('token', token)
      Cookies.remove('session_token')
      return null
    }

    const usuariosData = sessao.usuarios as unknown as Usuario

    const user: User = {
      id: usuariosData.id,
      username: usuariosData.username,
      nome_completo: usuariosData.nome_completo,
      tipo_usuario: usuariosData.tipo_usuario
    }

    localStorage.setItem('user', JSON.stringify(user))
    return user
  } catch (error) {
    console.error('Erro ao verificar sessão:', error)
    return null
  }
}

// Logout
export async function logout(): Promise<void> {
  const token = Cookies.get('session_token')
  
  if (token) {
    await supabase.from('sessoes').delete().eq('token', token)
    Cookies.remove('session_token')
  }
  
  localStorage.removeItem('user')
}

// Obter usuário atual
export function getUsuarioAtual(): User | null {
  const userStr = localStorage.getItem('user')
  return userStr ? (JSON.parse(userStr) as User) : null
}
