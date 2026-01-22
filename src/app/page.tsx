// src/app/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  ShoppingCart, 
  Store, 
  Package, 
  ArrowRight, 
  LogIn, 
  UserPlus,
  MapPin,
  Clock,
  Truck,
  X,
  Leaf,
  Apple,
  Carrot,
  CheckCircle,
  History,
  Users,
  ChevronRight
} from 'lucide-react'

// Categorias focadas em hortifrúti
const categorias = [
  {
    id: 1,
    nome: 'Frutas',
    icone: Apple,
    cor: '#e63946',
    exemplos: ['Manga', 'Açaí', 'Cupuaçu', 'Bacuri', 'Buriti']
  },
  {
    id: 2,
    nome: 'Legumes',
    icone: Carrot,
    cor: '#f4a261',
    exemplos: ['Abóbora', 'Maxixe', 'Quiabo', 'Jiló', 'Cenoura']
  },
  {
    id: 3,
    nome: 'Hortaliças',
    icone: Leaf,
    cor: '#038c25',
    exemplos: ['Vinagreira', 'Cheiro-verde', 'Couve', 'Alface']
  }
]

const beneficios = [
  {
    titulo: 'Direto do Produtor',
    desc: 'Produtos frescos colhidos pela manhã',
    icone: Leaf
  },
  {
    titulo: 'Entrega Rápida',
    desc: 'Receba no mesmo dia do pedido',
    icone: Truck
  },
  {
    titulo: 'Preço de Feira',
    desc: 'Sem intermediários, você economiza',
    icone: CheckCircle
  }
]

// Áreas do mapa do mercado (focado em hortifrúti)
const areasDoMercado = [
  {
    id: 1,
    nome: 'Entrada Principal',
    desc: 'Acesso pela Rua da Estrela',
    cor: '#038c25',
    posicao: { top: '10%', left: '45%' }
  },
  {
    id: 2,
    nome: 'Setor de Frutas',
    desc: 'Frutas regionais e tropicais',
    cor: '#e63946',
    posicao: { top: '35%', left: '20%' }
  },
  {
    id: 3,
    nome: 'Setor de Legumes',
    desc: 'Legumes frescos do dia',
    cor: '#f4a261',
    posicao: { top: '35%', left: '70%' }
  },
  {
    id: 4,
    nome: 'Setor de Hortaliças',
    desc: 'Verduras e temperos',
    cor: '#2a9d8f',
    posicao: { top: '65%', left: '45%' }
  },
  {
    id: 5,
    nome: 'Área de Carga',
    desc: 'Retirada de pedidos',
    cor: '#4f7bbf',
    posicao: { top: '85%', left: '45%' }
  }
]

export default function LandingPage() {
  const router = useRouter()
  const [mostrarModal, setMostrarModal] = useState(false)
  const [passo, setPasso] = useState<'landing' | 'cadastro'>('landing')
  const [areaSelecionada, setAreaSelecionada] = useState<number | null>(null)

  // Tela de cadastro
  if (passo === 'cadastro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-giro-verde-claro/10 to-neutral-0 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex-1 flex flex-col px-6">
          {/* Header simples */}
          <div className="text-center py-8">
            <div className="w-48 h-16 mx-auto relative">
              <Image
                src="/LOGO-COM-TEXTO.png"
                alt="Giro no Mercado"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-center text-neutral-900 mb-8">
            Como você quer se cadastrar?
          </h2>

          {/* Opções de cadastro */}
          <div className="flex-1 flex flex-col justify-center space-y-4 max-w-md mx-auto w-full">
          <button
            onClick={() => router.push('/cadastro/cliente')}
            className="w-full bg-neutral-0 border-2 border-giro-verde-claro active:bg-giro-verde-claro/10 text-neutral-900 rounded-2xl p-5 transition-all shadow-lg btn-touch"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-giro-verde-claro/10 rounded-xl flex items-center justify-center">
                <ShoppingCart size={28} className="text-giro-verde-claro" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold">Sou Cliente</h3>
                <p className="text-sm text-neutral-600">Quero comprar hortifrúti</p>
              </div>
              <ArrowRight size={24} className="text-neutral-400" />
            </div>
          </button>

          <button
            onClick={() => router.push('/cadastro/comerciante')}
            className="w-full bg-neutral-0 border-2 border-giro-amarelo active:bg-giro-amarelo/10 text-neutral-900 rounded-2xl p-5 transition-all shadow-lg btn-touch"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-giro-amarelo/10 rounded-xl flex items-center justify-center">
                <Store size={28} className="text-giro-amarelo" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold">Sou Feirante</h3>
                <p className="text-sm text-neutral-600">Tenho banca de hortifrúti</p>
              </div>
              <ArrowRight size={24} className="text-neutral-400" />
            </div>
          </button>

          <button
            onClick={() => router.push('/cadastro/entregador')}
            className="w-full bg-neutral-0 border-2 border-giro-azul-medio active:bg-giro-azul-medio/10 text-neutral-900 rounded-2xl p-5 transition-all shadow-lg btn-touch"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-giro-azul-medio/10 rounded-xl flex items-center justify-center">
                <Package size={28} className="text-giro-azul-medio" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold">Sou Entregador</h3>
                <p className="text-sm text-neutral-600">Quero fazer entregas</p>
              </div>
              <ArrowRight size={24} className="text-neutral-400" />
            </div>
          </button>
          </div>

          {/* Botão voltar */}
          <div className="py-6">
            <button
              onClick={() => setPasso('landing')}
              className="w-full text-neutral-600 active:text-neutral-900 font-bold text-lg py-4 btn-touch"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Landing Page Mobile-First
  return (
    <div className="min-h-screen bg-neutral-0 flex flex-col">
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 bg-neutral-0 z-50 border-b border-neutral-100 safe-area-inset">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="relative w-36 h-10">
            <Image
              src="/LOGO-COM-TEXTO.png"
              alt="Giro no Mercado"
              fill
              className="object-contain"
            />
          </div>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-giro-verde-escuro text-neutral-0 font-semibold rounded-xl text-sm active:opacity-80 btn-touch"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Hero Section - Mobile Optimized */}
      <section className="pt-20 pb-8 bg-gradient-to-b from-giro-verde-escuro to-giro-verde-claro text-neutral-0 px-4">
        <div className="text-center py-8">
          {/* Badge */}
          <span className="inline-block px-3 py-1.5 bg-neutral-0/20 rounded-full text-xs font-semibold mb-4">
            🥬 Hortifrúti Fresco de Verdade
          </span>
          
          {/* Título */}
          <h1 className="text-3xl font-bold mb-3 leading-tight">
            Do Mercado Central<br />
            <span className="text-giro-amarelo">pra sua casa</span>
          </h1>
          
          {/* Subtítulo */}
          <p className="text-base opacity-90 mb-6">
            Frutas, legumes e hortaliças fresquinhos com entrega rápida em São Luís
          </p>

          {/* CTA Principal */}
          <button
            onClick={() => setMostrarModal(true)}
            className="w-full max-w-xs mx-auto bg-neutral-0 text-giro-verde-escuro font-bold text-lg rounded-2xl py-4 shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform btn-touch"
          >
            <ShoppingCart size={24} />
            Fazer Pedido
          </button>
        </div>
      </section>

      {/* Categorias */}
      <section className="px-4 py-8 bg-neutral-0">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">
          O que você encontra
        </h2>
        
        <div className="space-y-3">
          {categorias.map((cat) => (
            <div 
              key={cat.id}
              className="bg-neutral-50 rounded-2xl p-4 border-2 border-neutral-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: cat.cor + '15' }}
                >
                  <cat.icone size={24} style={{ color: cat.cor }} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">{cat.nome}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.exemplos.map((ex) => (
                  <span 
                    key={ex}
                    className="px-3 py-1 bg-neutral-0 rounded-full text-sm text-neutral-700 border border-neutral-200"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Como Funciona */}
      <section className="px-4 py-8 bg-neutral-50">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">
          Como funciona
        </h2>
        
        <div className="space-y-4">
          {[
            { num: 1, titulo: 'Escolha', desc: 'Navegue pelos produtos e adicione ao carrinho', cor: '#038c25' },
            { num: 2, titulo: 'Peça', desc: 'Finalize e escolha o horário de retirada', cor: '#0460d9' },
            { num: 3, titulo: 'Receba', desc: 'O entregador leva até você fresquinho', cor: '#d9a404' },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-0 font-bold flex-shrink-0"
                style={{ backgroundColor: step.cor }}
              >
                {step.num}
              </div>
              <div>
                <h3 className="font-bold text-neutral-900">{step.titulo}</h3>
                <p className="text-sm text-neutral-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefícios */}
      <section className="px-4 py-8 bg-neutral-0">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">
          Por que escolher o Giro?
        </h2>
        
        <div className="space-y-3">
          {beneficios.map((ben, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-4 p-4 bg-giro-verde-claro/5 rounded-2xl border-2 border-giro-verde-claro/20"
            >
              <ben.icone size={28} className="text-giro-verde-escuro flex-shrink-0" />
              <div>
                <h3 className="font-bold text-neutral-900">{ben.titulo}</h3>
                <p className="text-sm text-neutral-600">{ben.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* História do Mercado */}
      <section className="px-4 py-8 bg-gradient-to-b from-giro-verde-escuro to-giro-verde-claro text-neutral-0">
        <div className="flex items-center gap-2 mb-4">
          <History size={20} className="text-giro-amarelo" />
          <h2 className="text-lg font-bold">Nossa História</h2>
        </div>
        
        {/* Timeline */}
        <div className="space-y-6">
          {/* Card principal */}
          <div className="bg-neutral-0/10 backdrop-blur-sm rounded-2xl p-5 border border-neutral-0/20">
            <div className="text-4xl font-bold text-giro-amarelo mb-2">1820</div>
            <h3 className="text-xl font-bold mb-3">Mais de 200 anos de tradição</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              O Mercado Central de São Luís, conhecido como <strong>Mercado das Tulhas</strong>, 
              nasceu às margens do Rio Bacanga, onde pescadores e agricultores comercializavam 
              suas mercadorias.
            </p>
          </div>

          {/* Fatos históricos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-0/10 backdrop-blur-sm rounded-xl p-4 text-center border border-neutral-0/20">
              <div className="text-2xl font-bold text-giro-amarelo">500+</div>
              <div className="text-xs opacity-80">Bancas ativas</div>
            </div>
            <div className="bg-neutral-0/10 backdrop-blur-sm rounded-xl p-4 text-center border border-neutral-0/20">
              <div className="text-2xl font-bold text-giro-amarelo">4</div>
              <div className="text-xs opacity-80">Galpões históricos</div>
            </div>
          </div>

          {/* Texto adicional */}
          <div className="space-y-3 text-sm opacity-90">
            <p>
              🏛️ <strong>Patrimônio Cultural</strong> - Localizado no Centro Histórico, 
              área tombada pela UNESCO como Patrimônio Mundial da Humanidade.
            </p>
            <p>
              👨‍👩‍👧‍👦 <strong>Tradição Familiar</strong> - Muitas bancas são passadas de geração 
              em geração, mantendo viva a cultura maranhense.
            </p>
            <p>
              🌿 <strong>Produtos Regionais</strong> - Vinagreira, buriti, bacuri e outros 
              produtos típicos que você só encontra aqui.
            </p>
          </div>
        </div>
      </section>

      {/* Mapa Interativo */}
      <section className="px-4 py-8 bg-neutral-50">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={20} className="text-giro-verde-escuro" />
          <h2 className="text-lg font-bold text-neutral-900">Conheça o Local</h2>
        </div>
        <p className="text-sm text-neutral-600 mb-4">
          Toque nos pontos para explorar as áreas do mercado
        </p>
        
        {/* Mapa Visual */}
        <div className="relative bg-neutral-200 rounded-2xl overflow-hidden" style={{ aspectRatio: '4/5' }}>
          {/* Fundo do mapa */}
          <div className="absolute inset-0 bg-gradient-to-b from-giro-verde-claro/20 to-giro-azul-medio/20" />
          
          {/* Estrutura do mercado */}
          <div className="absolute inset-4 border-2 border-dashed border-neutral-400 rounded-xl" />
          
          {/* Galpões representados */}
          <div className="absolute top-[25%] left-[10%] right-[10%] bottom-[25%] grid grid-cols-2 gap-2 p-2">
            <div className="bg-neutral-0/80 rounded-lg border-2 border-neutral-300 flex items-center justify-center">
              <span className="text-xs font-bold text-neutral-600">Galpão 1</span>
            </div>
            <div className="bg-neutral-0/80 rounded-lg border-2 border-neutral-300 flex items-center justify-center">
              <span className="text-xs font-bold text-neutral-600">Galpão 2</span>
            </div>
            <div className="bg-neutral-0/80 rounded-lg border-2 border-neutral-300 flex items-center justify-center">
              <span className="text-xs font-bold text-neutral-600">Galpão 3</span>
            </div>
            <div className="bg-neutral-0/80 rounded-lg border-2 border-neutral-300 flex items-center justify-center">
              <span className="text-xs font-bold text-neutral-600">Galpão 4</span>
            </div>
          </div>
          
          {/* Pontos interativos */}
          {areasDoMercado.map((area) => (
            <button
              key={area.id}
              onClick={() => setAreaSelecionada(areaSelecionada === area.id ? null : area.id)}
              className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-neutral-0 font-bold text-sm shadow-lg transition-all btn-touch ${
                areaSelecionada === area.id ? 'scale-125 ring-4 ring-neutral-0' : 'active:scale-110'
              }`}
              style={{ 
                top: area.posicao.top, 
                left: area.posicao.left,
                backgroundColor: area.cor,
                transform: `translate(-50%, -50%) ${areaSelecionada === area.id ? 'scale(1.25)' : ''}`
              }}
            >
              {area.id}
            </button>
          ))}
        </div>

        {/* Detalhes da área selecionada */}
        {areaSelecionada && (
          <div 
            className="mt-4 p-4 rounded-2xl border-2 animate-slide-up"
            style={{ 
              backgroundColor: areasDoMercado[areaSelecionada - 1].cor + '15',
              borderColor: areasDoMercado[areaSelecionada - 1].cor
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-0 font-bold"
                style={{ backgroundColor: areasDoMercado[areaSelecionada - 1].cor }}
              >
                {areaSelecionada}
              </div>
              <div>
                <h3 className="font-bold text-neutral-900">
                  {areasDoMercado[areaSelecionada - 1].nome}
                </h3>
                <p className="text-sm text-neutral-600">
                  {areasDoMercado[areaSelecionada - 1].desc}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Legenda */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-neutral-500 uppercase">Legenda</p>
          <div className="flex flex-wrap gap-2">
            {areasDoMercado.map((area) => (
              <button
                key={area.id}
                onClick={() => setAreaSelecionada(areaSelecionada === area.id ? null : area.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${
                  areaSelecionada === area.id 
                    ? 'bg-neutral-900 text-neutral-0' 
                    : 'bg-neutral-0 text-neutral-700 border border-neutral-200'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: area.cor }}
                />
                {area.nome}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Informações do Mercado */}
      <section className="px-4 py-8 bg-neutral-900 text-neutral-0">
        <h2 className="text-lg font-bold mb-4">
          Mercado Central de São Luís
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-giro-verde-claro flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Localização</p>
              <p className="text-sm text-neutral-400">Rua da Estrela, s/n - Centro Histórico</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-giro-amarelo flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Horário</p>
              <p className="text-sm text-neutral-400">Seg-Sáb: 6h às 18h | Dom: 6h às 13h</p>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
          <p className="text-xs text-neutral-500">
            © 2026 Giro no Mercado<br />
            Feito com ❤️ para São Luís
          </p>
        </div>
      </section>

      {/* Bottom CTA Fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-0 border-t-2 border-neutral-100 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex gap-3">
            <button
              onClick={() => setPasso('cadastro')}
              className="flex-1 border-2 border-giro-verde-escuro text-giro-verde-escuro font-bold py-3.5 rounded-xl active:bg-giro-verde-escuro/5 btn-touch"
            >
              Cadastrar
            </button>
            <button
              onClick={() => setMostrarModal(true)}
              className="flex-1 bg-giro-verde-escuro text-neutral-0 font-bold py-3.5 rounded-xl active:opacity-80 btn-touch flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Pedir
            </button>
          </div>
        </div>
      </div>

      {/* Espaço para o bottom CTA */}
      <div className="h-28" />

      {/* Modal de Acesso */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-neutral-900/70 backdrop-blur-sm z-[100] flex items-end justify-center px-4">
          <div className="bg-neutral-0 rounded-t-3xl w-full max-w-md animate-slide-up mb-0 pb-[env(safe-area-inset-bottom)]">
            <div className="px-6 pt-4 pb-6">
              {/* Handle */}
              <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-5" />
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-neutral-900">
                  Acesse sua conta
                </h3>
                <button 
                  onClick={() => setMostrarModal(false)}
                  className="p-2 active:bg-neutral-100 rounded-full btn-touch -mr-2 -mt-1"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-neutral-600 mb-6 text-sm">
                Para fazer pedidos, você precisa entrar ou criar uma conta.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setMostrarModal(false)
                    router.push('/login')
                  }}
                  className="w-full bg-giro-verde-escuro text-neutral-0 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:opacity-80 btn-touch"
                >
                  <LogIn size={20} />
                  Entrar na conta
                </button>

                <button
                  onClick={() => {
                    setMostrarModal(false)
                    setPasso('cadastro')
                  }}
                  className="w-full border-2 border-giro-verde-escuro text-giro-verde-escuro py-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-giro-verde-escuro/5 btn-touch"
                >
                  <UserPlus size={20} />
                  Criar conta grátis
                </button>
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs text-neutral-500">
                  Feirante ou entregador?{' '}
                  <button 
                    onClick={() => {
                      setMostrarModal(false)
                      setPasso('cadastro')
                    }}
                    className="text-giro-verde-escuro font-semibold"
                  >
                    Cadastre-se
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
