# 🧪 Testing the Voting System

## Quick Setup (2 minutes)

### 1. **Start the Database**
```bash
# Option A: Use the setup script
./setup-test.sh

# Option B: Manual setup
docker-compose up -d postgres
npx prisma migrate deploy
npx prisma generate
npm run seed
```

### 2. **Start the Website**
```bash
npm run dev
```

### 3. **Visit the Site**
Open http://localhost:3000

## 🎯 Testing the Voting System

### **Without Authentication (Basic Test)**
- Visit `/projects` to see project cards
- You'll see up/down arrow buttons next to projects
- Note: Voting won't work without authentication, but you can see the UI

### **With Authentication (Full Test)**
You need Clerk authentication keys. Get them from:
1. Go to https://clerk.com
2. Create a free account
3. Create a new application
4. Copy the keys to `.env.local`

### **What to Test**

1. **Vote Buttons Display** ✅
   - Green up arrows, red down arrows
   - Net score displayed between arrows
   - Hover effects work

2. **Vote Interactions** ✅
   - Click upvote → arrow turns green/solid
   - Click downvote → arrow turns red/solid  
   - Click same vote again → removes vote
   - Switch votes → removes old, adds new

3. **Score Updates** ✅
   - Score updates immediately after voting
   - Multiple users can vote on same project
   - Net score = upvotes - downvotes

4. **Project Detail Page** ✅
   - Large voting buttons in hero section
   - Same functionality as project cards

5. **Sorting** ✅
   - "Highest Rated" sort option
   - Projects sorted by net score

## 🛠 Troubleshooting

### Database Issues
```bash
# Reset database
docker-compose down
docker volume prune -f
./setup-test.sh
```

### Migration Issues
```bash
npx prisma db push --force-reset
npm run seed
```

### View Database
```bash
npx prisma studio
# Opens at http://localhost:5555
```

## 📊 Expected Test Data

After seeding, you should see:
- ~10 sample projects
- Random votes on projects (mostly upvotes, some downvotes)
- Test users (Connor, Sam, Serge, etc.)
- Various net scores to test sorting

## ✅ Success Criteria

- [ ] Vote buttons render correctly
- [ ] Clicking votes updates UI immediately  
- [ ] Net scores calculate correctly
- [ ] Sorting by "Highest Rated" works
- [ ] Project detail page voting works
- [ ] No console errors