module.exports = {
  apps: [{
    name: 'internship-tracker',
    script: 'server/index.js',
    cwd: '/data/.openclaw/workspace/internship-tracker',
    env: {
      PORT: 3099,
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000
  }]
};
