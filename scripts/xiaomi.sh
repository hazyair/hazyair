if ! grep -q -E dust config.json; then
  echo \{ \"parameter\": \"dust\", \"model\": \"$1\", \"options\": \{ \"device\": \"$2\" \} \} | node config.js
fi

if ! grep -q -E temperature config.json; then
  echo \{ \"parameter\": \"temperature\", \"model\": \"$1\", \"options\": \{ \"device\": \"$2\" \} \} | node config.js
fi

if ! grep -q -E humidity config.json; then
  echo \{ \"parameter\": \"humidity\", \"model\": \"$1\", \"options\": \{ \"device\": \"$2\" \} \} | node config.js
fi

if [ ! -d "db" ]; then
  mkdir db
fi

exit 0
