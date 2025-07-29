# 🚀 Ultimate Deployment Help Prompt Template

Copy and fill out this template when asking for deployment help to get the fastest, most accurate assistance:

---

## **Project Information**
- **Framework:** [NestJS/Express/FastAPI/Django/etc.]
- **Language & Version:** [Node.js 18.x, Python 3.9, etc.]
- **Database:** [MongoDB/PostgreSQL/MySQL + connection method]
- **Package Manager:** [npm/yarn/pnpm]
- **Deployment Platform:** [Render/Heroku/Vercel/AWS/Railway/etc.]

## **Current Issue**
### **Error Description:**
[Brief description of what's failing]

### **Complete Error Logs:**
```
[Paste the COMPLETE error logs here - don't truncate]
```

### **Expected Behavior:**
[What should happen]

## **Project Structure**
```
my-project/
├── src/
│   ├── main.ts (or app.js)
│   ├── app.module.ts
│   └── [other key files]
├── package.json
├── [config files]
└── [deployment files]
```

## **Key Configuration Files**

### **package.json scripts:**
```json
{
  "scripts": {
    "build": "...",
    "start": "...",
    "start:prod": "..."
  }
}
```

### **Main entry file (main.ts/app.js):**
```typescript
// Include your app.listen() configuration
```

### **Deployment configuration:**
```yaml
# render.yaml, Procfile, or deployment config
```

## **Environment & Build Info**
- **NODE_ENV:** [production/development]
- **Environment Variables Set:** [LIST_ALL_ENV_VARS]
- **Build Command Used:** [command]
- **Start Command Used:** [command]
- **Memory Limit:** [if known]

## **What I've Already Tried**
1. [Action 1 and result]
2. [Action 2 and result]
3. [Action 3 and result]

## **Deployment Platform Settings**
- **Build Command:** [current setting]
- **Start Command:** [current setting]
- **Environment Variables:** [list what's configured]
- **Region/Plan:** [if relevant]

## **Local Testing Results**
- **`npm run build` works locally:** [Yes/No/Error]
- **`npm run start:prod` works locally:** [Yes/No/Error]
- **Database connection works locally:** [Yes/No]

## **Specific Questions**
1. [Specific question 1]
2. [Specific question 2]

---

## **Quick Checklist Before Asking**
- [ ] I've included complete error logs (not truncated)
- [ ] I've tested the build process locally
- [ ] I've verified my environment variables are set
- [ ] I've checked my deployment platform's build/start commands
- [ ] I've mentioned what I've already tried

---

**Example:** "I'm deploying a NestJS app to Render but getting 'Cannot find module dist/main' errors. Here's my complete setup..." 