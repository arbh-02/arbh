# Exemplo de Configuração Nginx para Implantação

Este guia mostra como configurar um servidor Nginx para hospedar esta aplicação React (Single Page Application).

## Passo 1: Compilar o Projeto

No seu computador de desenvolvimento (ou em um servidor de build), execute o seguinte comando na raiz do projeto:

```sh
npm run build
```

Isso criará uma pasta chamada `dist` contendo todos os arquivos estáticos otimizados (HTML, CSS, JS) da sua aplicação.

## Passo 2: Copiar os Arquivos para o Servidor

Copie **todo o conteúdo** da pasta `dist` para o diretório raiz do seu site no servidor. Geralmente, este caminho é algo como `/var/www/seu-dominio.com/html`.

## Passo 3: Configurar o Nginx

Crie ou edite o arquivo de configuração do seu site no Nginx (geralmente localizado em `/etc/nginx/sites-available/seu-dominio.com`). Cole o seguinte conteúdo, ajustando `seu-dominio.com` e o caminho em `root`.

```nginx
server {
    # Escuta na porta 80 para tráfego HTTP
    listen 80;
    listen [::]:80;

    # O nome de domínio que este bloco de servidor irá responder
    server_name seu-dominio.com www.seu-dominio.com;

    # O caminho para os arquivos da sua aplicação (o conteúdo da pasta 'dist')
    root /var/www/seu-dominio.com/html;

    # O arquivo padrão a ser servido
    index index.html;

    # Configuração principal para Single Page Applications (SPA)
    location / {
        # Tenta servir o arquivo solicitado diretamente ($uri).
        # Se for um diretório, tenta servir o diretório ($uri/).
        # Se nenhum dos dois for encontrado, ele retorna o /index.html.
        # Isso permite que o roteamento do React (react-router-dom) assuma o controle.
        try_files $uri $uri/ /index.html;
    }

    # Opcional: Configurações de cache para arquivos estáticos
    location ~* \.(?:jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc|css|js)$ {
        expires 1M;
        add_header Cache-Control "public";
    }
}
```

## Passo 4: Ativar a Configuração e Reiniciar o Nginx

Depois de salvar o arquivo de configuração, ative-o (se for um novo arquivo) e reinicie o Nginx para que as alterações entrem em vigor.

```sh
# Crie um link simbólico para ativar o site (se necessário)
sudo ln -s /etc/nginx/sites-available/seu-dominio.com /etc/nginx/sites-enabled/

# Teste a configuração do Nginx para erros de sintaxe
sudo nginx -t

# Se o teste for bem-sucedido, reinicie o Nginx
sudo systemctl restart nginx
```

Agora sua aplicação deve estar funcionando no seu domínio!