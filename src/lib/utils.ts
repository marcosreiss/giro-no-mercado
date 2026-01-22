// src/lib/utils.ts - Utilitários do sistema

/**
 * Formata data para exibição em português
 */
export function formatarData(data: string | Date, formato: 'completo' | 'curto' | 'hora' = 'completo'): string {
    const date = typeof data === 'string' ? new Date(data) : data

    if (formato === 'hora') {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (formato === 'curto') {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

/**
 * Formata valor monetário para real brasileiro
 */
export function formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    })
}

/**
 * Retorna texto relativo ao tempo (ex: "há 2 horas")
 */
export function tempoRelativo(data: string | Date): string {
    const date = typeof data === 'string' ? new Date(data) : data
    const agora = new Date()
    const diferenca = agora.getTime() - date.getTime()

    const minutos = Math.floor(diferenca / 60000)
    const horas = Math.floor(diferenca / 3600000)
    const dias = Math.floor(diferenca / 86400000)

    if (minutos < 1) return 'Agora'
    if (minutos < 60) return `Há ${minutos} min`
    if (horas < 24) return `Há ${horas}h`
    if (dias < 7) return `Há ${dias} dias`
    return formatarData(date, 'curto')
}

/**
 * Retorna informações de status do pedido
 */
export function getStatusPedidoInfo(status: string) {
    const statusMap: Record<string, {
        label: string
        desc: string
        color: string
        bg: string
        border: string
        emoji: string
    }> = {
        'aguardando_aprovacao': {
            label: 'Aguardando Aprovação',
            desc: 'Aguardando o comerciante aceitar',
            color: 'text-giro-amarelo',
            bg: 'bg-giro-amarelo/10',
            border: 'border-giro-amarelo/30',
            emoji: '⏳'
        },
        'aprovado': {
            label: 'Aprovado',
            desc: 'Aguardando entregador',
            color: 'text-giro-verde-escuro',
            bg: 'bg-giro-verde-escuro/10',
            border: 'border-giro-verde-escuro/30',
            emoji: '✅'
        },
        'em_entrega': {
            label: 'Em Entrega',
            desc: 'Seu pedido está a caminho!',
            color: 'text-giro-azul-medio',
            bg: 'bg-giro-azul-medio/10',
            border: 'border-giro-azul-medio/30',
            emoji: '🚴'
        },
        'aguardando_confirmacao': {
            label: 'Aguardando Confirmação',
            desc: 'Confirme o recebimento',
            color: 'text-success',
            bg: 'bg-success/10',
            border: 'border-success/30',
            emoji: '📦'
        },
        'entregue': {
            label: 'Entregue',
            desc: 'Pedido concluído com sucesso',
            color: 'text-success',
            bg: 'bg-success/10',
            border: 'border-success/30',
            emoji: '✅'
        },
        'cancelado': {
            label: 'Cancelado',
            desc: 'Pedido foi cancelado',
            color: 'text-error',
            bg: 'bg-error/10',
            border: 'border-error/30',
            emoji: '❌'
        },
        'rejeitado': {
            label: 'Rejeitado',
            desc: 'Pedido foi rejeitado',
            color: 'text-error',
            bg: 'bg-error/10',
            border: 'border-error/30',
            emoji: '❌'
        }
    }

    return statusMap[status] || statusMap['cancelado']
}
