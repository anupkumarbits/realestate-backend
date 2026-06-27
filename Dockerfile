# ─────────────────────────────────────────────────
# STAGE 1: BUILDER
# Yahan npm install hoga — devDependencies ke saath
# Ye stage final image mein nahi jaati
# ─────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Pehle sirf package files copy karo
# Iska faida: agar code change hua but package.json nahi,
# to npm install wala layer cache se aayega — fast build
COPY package*.json ./

# npm ci kyun:
# - package-lock.json se exact versions install karta hai
# - CI/CD ke liye banana tha, faster + deterministic
# - npm install se zyada reliable hai
RUN npm ci

# Ab baaki code copy karo
COPY . .


# ─────────────────────────────────────────────────
# STAGE 2: PRODUCTION
# Sirf wahi cheez jo runtime mein chahiye
# node_modules bhi sirf production wale
# ─────────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: root user nahi chalayenge
# Agar container hack ho jaye to bhi system safe rahe
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Builder stage se sirf production node_modules copy karo
# devDependencies yahan nahi aayegi
COPY --from=builder /app/node_modules ./node_modules

# Application code copy karo
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

# Agar aur files hain (routes, controllers, models, etc.)
# to unhe bhi copy karo:
# COPY --from=builder /app/src ./src
# COPY --from=builder /app/config ./config

# Non-root user ko owner banao
RUN chown -R appuser:appgroup /app

# Ab is user pe switch karo
USER appuser

# Port expose karo (documentation ke liye, actual mapping docker run mein hoti hai)
EXPOSE 5000

# Healthcheck: Docker ko pata chalega container sahi chal raha hai ya nahi
# Jenkins aur Grafana dono is status ko use kar sakte hain
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })" \
  || exit 1

# node seedha use kar rahe hain (npm start nahi)
# Kyun: npm extra process hai, signals properly forward nahi karta
# node directly SIGTERM/SIGINT handle karta hai — graceful shutdown hoga
CMD ["node", "server.js"]
