#!/usr/bin/env bash
# Первичная настройка нового сервера (Ubuntu 24.04). Запускать один раз под root.
#
# bash setup.sh --pubkey "ssh-ed25519 AAAA... deploy" [--site-domain example.ru] [--admin-domain admin.example.ru]
#               [--no-domain IP] [--harden-ssh]
#
# --pubkey      публичный ключ для пользователя deploy (ПРИВАТНЫЙ ключ в GitHub Secrets, сюда его не передавать)
# --no-domain   тест без домена: сайт по http://IP, админка по http://IP:8081
# --harden-ssh  отключить вход по паролю. Включайте только после того, как вход deploy по ключу проверен
#               во втором окне терминала, иначе можно потерять доступ.
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "Запустите под root"; exit 1; }

PUBKEY="" SITE_DOMAIN="" ADMIN_DOMAIN="" NODOMAIN_IP="" HARDEN=0
while [ $# -gt 0 ]; do
  case "$1" in
    --pubkey) PUBKEY="$2"; shift 2 ;;
    --site-domain) SITE_DOMAIN="$2"; shift 2 ;;
    --admin-domain) ADMIN_DOMAIN="$2"; shift 2 ;;
    --no-domain) NODOMAIN_IP="$2"; shift 2 ;;
    --harden-ssh) HARDEN=1; shift ;;
    *) echo "Неизвестный параметр: $1"; exit 1 ;;
  esac
done
[ -n "$PUBKEY" ] || { echo "Нужен --pubkey"; exit 1; }
case "$PUBKEY" in ssh-ed25519\ *|ssh-rsa\ *|ecdsa-sha2-*) ;; *) echo "--pubkey должен быть публичным ключом (ssh-ed25519 ...)"; exit 1 ;; esac
if [ -z "$NODOMAIN_IP" ] && { [ -z "$SITE_DOMAIN" ] || [ -z "$ADMIN_DOMAIN" ]; }; then
  echo "Укажите --site-domain и --admin-domain, либо --no-domain IP"; exit 1
fi

export DEBIAN_FRONTEND=noninteractive
echo "== Пакеты"
apt-get update -y
apt-get install -y docker.io docker-compose-v2 ufw fail2ban unattended-upgrades rsync curl openssl restic
systemctl enable --now docker

echo "== Пользователь deploy"
id deploy >/dev/null 2>&1 || adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
echo "$PUBKEY" > /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys

echo "== Swap"
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "== Firewall (22, 80, 443$([ -n "$NODOMAIN_IP" ] && echo ', 8081'))"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
[ -z "$NODOMAIN_IP" ] || ufw allow 8081/tcp
ufw --force enable

echo "== Автообновления безопасности и fail2ban"
systemctl enable --now fail2ban unattended-upgrades

if [ "$HARDEN" -eq 1 ]; then
  echo "== SSH: вход только по ключу"
  cat > /etc/ssh/sshd_config.d/99-hardening.conf <<'CONF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
CONF
  sshd -t && systemctl reload ssh
fi

echo "== Каталог проекта и .env"
install -d -m 755 -o deploy -g deploy /opt/quality
ENVF=/opt/quality/.env
if [ ! -f "$ENVF" ]; then
  rnd() { openssl rand -hex 24; }
  if [ -n "$NODOMAIN_IP" ]; then
    SITE="http://$NODOMAIN_IP"; ADMIN="http://$NODOMAIN_IP:8081"; CMSURL="http://$NODOMAIN_IP:8081"
    COMPOSE="COMPOSE_FILE=docker-compose.yml:docker-compose.nodomain.yml"
  else
    SITE="$SITE_DOMAIN"; ADMIN="$ADMIN_DOMAIN"; CMSURL="https://$ADMIN_DOMAIN"; COMPOSE=""
  fi
  ADMIN_PASS="$(openssl rand -base64 18 | tr -d '/+=')"
  cat > "$ENVF" <<ENVEOF
SITE_DOMAIN=$SITE
ADMIN_DOMAIN=$ADMIN
CMS_PUBLIC_URL=$CMSURL
$COMPOSE
POSTGRES_DB=quality
POSTGRES_USER=quality
POSTGRES_PASSWORD=$(rnd)
CMS_SECRET=$(rnd)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=$ADMIN_PASS
CMS_ADMIN_TOKEN=$(rnd)
DIRECTUS_TOKEN=$(rnd)
RESTIC_REPOSITORY=
RESTIC_PASSWORD=$(rnd)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
ENVEOF
  chown deploy:deploy "$ENVF"; chmod 600 "$ENVF"
  echo "Создан $ENVF (случайные секреты). Администратор CMS: admin@example.com / $ADMIN_PASS"
  echo "Пароль показан один раз. Замените email администратора на свой в $ENVF до первого запуска."
else
  echo "$ENVF уже есть, не трогаю"
fi

echo
echo "== Готово. Отпечаток ключа сервера (для DEPLOY_KNOWN_HOSTS):"
IP="$(hostname -I | awk '{print $1}')"
echo "$IP $(cut -d' ' -f1,2 /etc/ssh/ssh_host_ed25519_key.pub)"
echo "Замените $IP на адрес, по которому GitHub будет подключаться, если он другой."
