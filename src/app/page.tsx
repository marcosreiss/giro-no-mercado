// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
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
  Phone,
  ChevronDown,
  Truck,
  Star,
  Users,
  Search,
  X,
  Leaf,
  Fish,
  Beef,
  Coffee,
  Shirt,
  Gem,
  Flower2,
  Bird,
  Palette,
  UtensilsCrossed,
  ShoppingBag,
  Sparkles,
  Heart
} from 'lucide-react'

// Dados do Mercado baseados na setorização oficial
const galpoes = [
  {
    id: 1,
    nome: 'Galpão 1',
    cor: '#038c25',
    setores: [
      { nome: 'Frutas', icone: Leaf, quantidade: 45 },
      { nome: 'Verduras', icone: Leaf, quantidade: 38 },
      { nome: 'Legumes', icone: Leaf, quantidade: 32 },
      { nome: 'Temperos', icone: Sparkles, quantidade: 25 },
    ],
    descricao: 'Hortifrúti frescos direto do produtor'
  },
  {
    id: 2,
    nome: 'Galpão 2',
    cor: '#0460d9',
    setores: [
      { nome: 'Peixes', icone: Fish, quantidade: 52 },
      { nome: 'Frutos do Mar', icone: Fish, quantidade: 28 },
      { nome: 'Carnes', icone: Beef, quantidade: 35 },
      { nome: 'Aves', icone: Bird, quantidade: 18 },
    ],
    descricao: 'Carnes e pescados selecionados'
  },
  {
    id: 3,
    nome: 'Galpão 3',
    cor: '#d9a404',
    setores: [
      { nome: 'Artesanato', icone: Palette, quantidade: 65 },
      { nome: 'Roupas', icone: Shirt, quantidade: 48 },
      { nome: 'Acessórios', icone: Gem, quantidade: 42 },
      { nome: 'Flores', icone: Flower2, quantidade: 22 },
    ],
    descricao: 'Arte, cultura e moda maranhense'
  },
  {
    id: 4,
    nome: 'Galpão 4',
    cor: '#4f7bbf',
    setores: [
      { nome: 'Lanchonetes', icone: Coffee, quantidade: 28 },
      { nome: 'Restaurantes', icone: UtensilsCrossed, quantidade: 15 },
      { nome: 'Produtos Típicos', icone: ShoppingBag, quantidade: 35 },
      { nome: 'Ervas Medicinais', icone: Heart, quantidade: 20 },
    ],
    descricao: 'Sabores e tradições do Maranhão'
  }
]

const estatisticas = [
  { label: 'Bancas Ativas', valor: '500+', icone: Store },
  { label: 'Anos de História', valor: '200+', icone: Clock },
  { label: 'Feirantes Cadastrados', valor: '350+', icone: Users },
  { label: 'Entregas Realizadas', valor: '10K+', icone: Truck },
]

const produtosPopulares = [
  'Camarão Seco', 'Vinagreira', 'Farinha d\'água', 'Tucupi', 
  'Açaí', 'Caranguejo', 'Juçara', 'Baião de Dois',
  'Artesanato em Buriti', 'Redes de Dormir', 'Cerâmicas'
]

export default function LandingPage() {
  const router = useRouter()
  const [galpaoSelecionado, setGalpaoSelecionado] = useState<number | null>(null)
  const [buscaProduto, setBuscaProduto] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [passo, setPasso] = useState<'landing' | 'cadastro'>('landing')

  if (passo === 'cadastro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-giro-verde-claro/10 to-neutral-0 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <div className="w-64 h-24 mx-auto mb-4 relative">
            <Image
              src="/LOGO-COM-TEXTO.png"
              alt="Giro no Mercado"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="w-full max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-center text-neutral-900 mb-6">
            Como você quer se cadastrar?
          </h2>

          <button
            onClick={() => router.push('/cadastro/cliente')}
            className="w-full bg-neutral-0 border-2 border-giro-verde-claro active:bg-giro-verde-claro/10 text-neutral-900 rounded-2xl p-6 transition-all shadow-lg btn-touch"
          >
            <div className="flex items-center gap-4">
              <ShoppingCart size={48} className="text-giro-verde-claro flex-shrink-0" />
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold">Sou Cliente</h3>
                <p className="text-sm text-neutral-600">Quero comprar produtos frescos</p>
              </div>
              <ArrowRight size={24} className="text-neutral-400 flex-shrink-0" />
            </div>
          </button>

          <button
            onClick={() => router.push('/cadastro/comerciante')}
            className="w-full bg-neutral-0 border-2 border-giro-amarelo active:bg-giro-amarelo/10 text-neutral-900 rounded-2xl p-6 transition-all shadow-lg btn-touch"
          >
            <div className="flex items-center gap-4">
              <Store size={48} className="text-giro-amarelo flex-shrink-0" />
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold">Sou Feirante</h3>
                <p className="text-sm text-neutral-600">Tenho uma banca no mercado</p>
              </div>
              <ArrowRight size={24} className="text-neutral-400 flex-shrink-0" />
            </div>
          </button>

          <button
            onClick={() => router.push('/cadastro/entregador')}
            className="w-full bg-neutral-0 border-2 border-giro-azul-medio active:bg-giro-azul-medio/10 text-neutral-900 rounded-2xl p-6 transition-all shadow-lg btn-touch"
          >
            <div className="flex items-center gap-4">
              <Package size={48} className="text-giro-azul-medio flex-shrink-0" />
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold">Sou Entregador Parceiro</h3>
                <p className="text-sm text-neutral-600">Quero fazer entregas</p>
              </div>
              <ArrowRight size={24} className="text-neutral-400 flex-shrink-0" />
            </div>
          </button>

          <button
            onClick={() => setPasso('landing')}
            className="w-full mt-6 text-neutral-600 active:text-neutral-900 font-bold text-lg btn-touch py-4"
          >
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-0">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-neutral-0/95 backdrop-blur-sm z-50 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="relative w-40 h-12">
            <Image
              src="/LOGO-COM-TEXTO.png"
              alt="Giro no Mercado"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-giro-verde-escuro font-semibold hover:bg-neutral-50 rounded-lg transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => setPasso('cadastro')}
              className="px-4 py-2 bg-giro-verde-escuro text-neutral-0 font-semibold rounded-lg hover:bg-giro-verde-escuro/90 transition-colors"
            >
              Cadastrar
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-giro-verde-escuro via-giro-verde-claro/90 to-giro-amarelo/80 text-neutral-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-feira.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-neutral-0/20 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
              🏛️ Patrimônio Histórico de São Luís
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Mercado Central
              <br />
              <span className="text-giro-amarelo">de São Luís</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-95">
              Mais de 200 anos de história, sabores e tradições maranhenses.
              Agora com delivery direto na sua porta!
            </p>
            
            {/* Barra de busca */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={24} />
                <input
                  type="text"
                  placeholder="Buscar produto ou banca..."
                  value={buscaProduto}
                  onChange={(e) => setBuscaProduto(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full text-neutral-900 text-lg shadow-xl focus:ring-4 focus:ring-giro-amarelo/50"
                />
                {buscaProduto && (
                  <button 
                    onClick={() => setBuscaProduto('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              {/* Sugestões */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {produtosPopulares.slice(0, 5).map((produto) => (
                  <button
                    key={produto}
                    onClick={() => setBuscaProduto(produto)}
                    className="px-3 py-1 bg-neutral-0/20 hover:bg-neutral-0/30 rounded-full text-sm backdrop-blur-sm transition-colors"
                  >
                    {produto}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setMostrarModal(true)}
                className="px-8 py-4 bg-neutral-0 text-giro-verde-escuro font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart size={24} />
                Fazer Pedido Agora
              </button>
              <a
                href="#mapa"
                className="px-8 py-4 border-2 border-neutral-0 text-neutral-0 font-bold text-lg rounded-full hover:bg-neutral-0/10 transition-all flex items-center justify-center gap-2"
              >
                <MapPin size={24} />
                Explorar o Mapa
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown size={32} className="text-neutral-0/70" />
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {estatisticas.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-neutral-0 rounded-2xl shadow-lg">
                <stat.icone className="mx-auto mb-3 text-giro-verde-escuro" size={40} />
                <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-1">
                  {stat.valor}
                </div>
                <div className="text-neutral-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* História do Mercado */}
      <section className="py-20 bg-neutral-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-giro-verde-escuro font-semibold text-sm uppercase tracking-wider">
                Nossa História
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mt-2 mb-6">
                Dois Séculos de Tradição e Cultura
              </h2>
              <div className="space-y-4 text-neutral-600 text-lg leading-relaxed">
                <p>
                  O <strong className="text-neutral-900">Mercado Central de São Luís</strong>, também conhecido como 
                  <em> Mercado das Tulhas</em> ou <em>Mercado Praia Grande</em>, é um dos mais tradicionais 
                  centros comerciais do Brasil, localizado no coração do Centro Histórico de São Luís, 
                  patrimônio mundial da UNESCO.
                </p>
                <p>
                  Fundado no <strong className="text-neutral-900">início do século XIX</strong>, o mercado nasceu 
                  às margens do Rio Bacanga, onde os pescadores e agricultores desembarcavam suas mercadorias. 
                  Ao longo dos anos, tornou-se o principal ponto de encontro entre a cultura popular 
                  maranhense e o comércio tradicional.
                </p>
                <p>
                  Com seus <strong className="text-neutral-900">quatro galpões históricos</strong>, o mercado 
                  reúne mais de 500 bancas que oferecem desde os mais frescos pescados e frutos do mar, 
                  passando por artesanato típico, ervas medicinais, até os famosos temperos da culinária 
                  maranhense como a vinagreira e o cheiro-verde.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-giro-verde-claro/10 text-giro-verde-escuro rounded-full text-sm font-semibold">
                  Patrimônio Cultural
                </span>
                <span className="px-4 py-2 bg-giro-azul-medio/10 text-giro-azul-escuro rounded-full text-sm font-semibold">
                  Centro Histórico UNESCO
                </span>
                <span className="px-4 py-2 bg-giro-amarelo/10 text-giro-amarelo rounded-full text-sm font-semibold">
                  Tradição Secular
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-giro-verde-escuro to-giro-verde-claro rounded-3xl p-8 text-neutral-0 shadow-2xl">
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <div className="text-6xl font-bold mb-2">1820</div>
                    <div className="text-xl opacity-90">Fundação oficial</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-neutral-0/20 rounded-full flex items-center justify-center">
                        <Store size={24} />
                      </div>
                      <div>
                        <div className="font-bold">4 Galpões</div>
                        <div className="text-sm opacity-80">Setorizados por categoria</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-neutral-0/20 rounded-full flex items-center justify-center">
                        <Users size={24} />
                      </div>
                      <div>
                        <div className="font-bold">500+ Comerciantes</div>
                        <div className="text-sm opacity-80">Famílias tradicionais</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-neutral-0/20 rounded-full flex items-center justify-center">
                        <Heart size={24} />
                      </div>
                      <div>
                        <div className="font-bold">Cultura Viva</div>
                        <div className="text-sm opacity-80">Identidade maranhense</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-giro-amarelo rounded-full opacity-20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-giro-azul-medio rounded-full opacity-20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Mapa Interativo */}
      <section id="mapa" className="py-20 bg-gradient-to-b from-neutral-50 to-neutral-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-giro-verde-escuro font-semibold text-sm uppercase tracking-wider">
              Mapa Interativo
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mt-2 mb-4">
              Explore os 4 Galpões do Mercado
            </h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              Clique em um galpão para descobrir os setores e produtos disponíveis.
              Cada área foi organizada para facilitar sua experiência de compra.
            </p>
          </div>

          {/* Mapa SVG Interativo */}
          <div className="bg-neutral-0 rounded-3xl shadow-2xl p-8 mb-8">
            <div className="relative max-w-4xl mx-auto">
              {/* Layout do Mercado */}
              <div className="grid grid-cols-2 gap-4">
                {galpoes.map((galpao) => (
                  <button
                    key={galpao.id}
                    onClick={() => setGalpaoSelecionado(galpaoSelecionado === galpao.id ? null : galpao.id)}
                    className={`
                      relative p-6 rounded-2xl transition-all duration-300 text-left border-2
                      ${galpaoSelecionado === galpao.id 
                        ? 'ring-4 ring-offset-2 scale-105 shadow-2xl' 
                        : 'hover:scale-102 shadow-lg hover:shadow-xl'}
                    `}
                    style={{ 
                      backgroundColor: galpao.cor + '15',
                      borderColor: galpao.cor,
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900">{galpao.nome}</h3>
                        <p className="text-sm text-neutral-600 mt-1">{galpao.descricao}</p>
                      </div>
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-0 font-bold text-lg"
                        style={{ backgroundColor: galpao.cor }}
                      >
                        {galpao.id}
                      </div>
                    </div>
                    
                    {/* Setores */}
                    <div className="grid grid-cols-2 gap-2">
                      {galpao.setores.map((setor, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-neutral-0/80 rounded-lg"
                        >
                          <setor.icone size={16} style={{ color: galpao.cor }} />
                          <span className="text-sm text-neutral-700">{setor.nome}</span>
                          <span className="text-xs text-neutral-400 ml-auto">{setor.quantidade}</span>
                        </div>
                      ))}
                    </div>

                    {/* Indicador de seleção */}
                    {galpaoSelecionado === galpao.id && (
                      <div 
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-neutral-0"
                        style={{ backgroundColor: galpao.cor }}
                      >
                        Selecionado
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Legenda central */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="bg-neutral-900 text-neutral-0 px-4 py-2 rounded-full text-sm font-semibold shadow-xl">
                  <MapPin className="inline mr-2" size={16} />
                  Mercado Central
                </div>
              </div>
            </div>
          </div>

          {/* Detalhes do Galpão Selecionado */}
          {galpaoSelecionado && (
            <div className="bg-neutral-0 rounded-3xl shadow-xl p-8">
              {(() => {
                const galpao = galpoes.find(g => g.id === galpaoSelecionado)!
                return (
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-neutral-0 font-bold text-2xl"
                        style={{ backgroundColor: galpao.cor }}
                      >
                        {galpao.id}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-neutral-900">{galpao.nome}</h3>
                        <p className="text-neutral-600">{galpao.descricao}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {galpao.setores.map((setor, idx) => (
                        <div 
                          key={idx}
                          className="p-6 rounded-2xl text-center transition-all hover:scale-105 cursor-pointer"
                          style={{ backgroundColor: galpao.cor + '10' }}
                        >
                          <setor.icone 
                            size={48} 
                            className="mx-auto mb-3" 
                            style={{ color: galpao.cor }} 
                          />
                          <h4 className="font-bold text-neutral-900 mb-1">{setor.nome}</h4>
                          <p className="text-sm text-neutral-600">{setor.quantidade} bancas</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => setMostrarModal(true)}
                        className="px-6 py-3 rounded-full font-semibold text-neutral-0 transition-all hover:scale-105"
                        style={{ backgroundColor: galpao.cor }}
                      >
                        <ShoppingCart className="inline mr-2" size={20} />
                        Comprar do {galpao.nome}
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-neutral-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-giro-verde-escuro font-semibold text-sm uppercase tracking-wider">
              Delivery Prático
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mt-2 mb-4">
              Como Funciona o Giro no Mercado
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { 
                passo: 1, 
                titulo: 'Escolha os Produtos', 
                desc: 'Navegue pelo mapa e encontre frutas, carnes, artesanato e muito mais',
                icone: Search,
                cor: '#038c25'
              },
              { 
                passo: 2, 
                titulo: 'Faça o Pedido', 
                desc: 'Adicione ao carrinho e escolha o horário de retirada ou entrega',
                icone: ShoppingCart,
                cor: '#0460d9'
              },
              { 
                passo: 3, 
                titulo: 'Feirante Prepara', 
                desc: 'O comerciante separa os produtos fresquinhos para você',
                icone: Store,
                cor: '#d9a404'
              },
              { 
                passo: 4, 
                titulo: 'Receba em Casa', 
                desc: 'Nosso entregador leva até sua porta com segurança',
                icone: Truck,
                cor: '#4f7bbf'
              },
            ].map((item) => (
              <div key={item.passo} className="text-center">
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-neutral-0 shadow-lg"
                  style={{ backgroundColor: item.cor }}
                >
                  <item.icone size={36} />
                </div>
                <div className="text-sm font-semibold text-neutral-400 mb-2">Passo {item.passo}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{item.titulo}</h3>
                <p className="text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-giro-verde-escuro via-giro-verde-claro to-giro-amarelo text-neutral-0">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Pronto para dar um Giro no Mercado?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de ludovicenses que já descobriram a praticidade de receber 
            produtos frescos do Mercado Central em casa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setMostrarModal(true)}
              className="px-8 py-4 bg-neutral-0 text-giro-verde-escuro font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart size={24} />
              Começar a Comprar
            </button>
            <button
              onClick={() => setPasso('cadastro')}
              className="px-8 py-4 border-2 border-neutral-0 text-neutral-0 font-bold text-lg rounded-full hover:bg-neutral-0/10 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={24} />
              Criar Conta Grátis
            </button>
          </div>
        </div>
      </section>

      {/* Informações de Contato */}
      <section className="py-12 bg-neutral-900 text-neutral-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <MapPin className="mx-auto mb-4 text-giro-verde-claro" size={32} />
              <h4 className="font-bold mb-2">Localização</h4>
              <p className="text-neutral-400">
                Rua da Estrela, s/n - Centro Histórico<br />
                São Luís - MA, 65010-200
              </p>
            </div>
            <div className="text-center">
              <Clock className="mx-auto mb-4 text-giro-amarelo" size={32} />
              <h4 className="font-bold mb-2">Horário de Funcionamento</h4>
              <p className="text-neutral-400">
                Segunda a Sábado: 6h às 18h<br />
                Domingos e Feriados: 6h às 13h
              </p>
            </div>
            <div className="text-center">
              <Phone className="mx-auto mb-4 text-giro-azul-medio" size={32} />
              <h4 className="font-bold mb-2">Contato</h4>
              <p className="text-neutral-400">
                (98) 3232-0000<br />
                contato@gironomercado.com.br
              </p>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-12 pt-8 text-center">
            <div className="relative w-32 h-12 mx-auto mb-4">
              <Image
                src="/LOGO-COM-TEXTO.png"
                alt="Giro no Mercado"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
            <p className="text-neutral-500 text-sm">
              © 2026 Giro no Mercado. Todos os direitos reservados.<br />
              Feito com ❤️ para o Mercado Central de São Luís
            </p>
          </div>
        </div>
      </section>

      {/* Modal de Acesso */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-neutral-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-neutral-0 rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-neutral-900">
                Acesse o Sistema
              </h3>
              <button 
                onClick={() => setMostrarModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-neutral-600 mb-6">
              Para fazer pedidos no Mercado Central, você precisa entrar ou criar uma conta.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setMostrarModal(false)
                  router.push('/login')
                }}
                className="w-full bg-giro-verde-escuro text-neutral-0 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-giro-verde-escuro/90 transition-colors"
              >
                <LogIn size={24} />
                Entrar na minha conta
              </button>

              <button
                onClick={() => {
                  setMostrarModal(false)
                  setPasso('cadastro')
                }}
                className="w-full border-2 border-giro-verde-escuro text-giro-verde-escuro py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-giro-verde-escuro/5 transition-colors"
              >
                <UserPlus size={24} />
                Criar conta grátis
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-500 text-center">
                É feirante ou entregador?{' '}
                <button 
                  onClick={() => {
                    setMostrarModal(false)
                    setPasso('cadastro')
                  }}
                  className="text-giro-verde-escuro font-semibold hover:underline"
                >
                  Cadastre-se aqui
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
