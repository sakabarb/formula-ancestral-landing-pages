# A Fórmula Ancestral do Solo — Landing Pages (advertoriais)

Conjunto de landing pages de venda (estilo advertorial PT-BR) para o
infoproduto **A Fórmula Ancestral do Solo** (guia digital em PDF + vídeo aula).

## Estrutura

```
landing pages/
├── 1/            → Landing page 1 (index.html, style.css, script.js)
├── 2/ 3/ 4/      → Próximas landing pages (mesma estrutura)
├── images/       → Imagens COMPARTILHADAS entre todas as páginas
├── vercel.json   → Redireciona "/" para "/1/"
└── .gitignore
```

As páginas referenciam as imagens como `../images/NOME` (pasta universal,
um nível acima). Por isso a **raiz do deploy é esta pasta** (`landing pages/`),
servindo cada página em `/1/`, `/2/`, etc.

## Deploy

- Produção (Vercel): deploy a partir desta pasta. A raiz `/` redireciona para `/1/`.
- Checkout: Hotmart `https://pay.hotmart.com/C106251108Q`.
