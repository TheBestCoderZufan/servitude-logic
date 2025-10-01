<!--
source .bashrc && update_tree && code DIRECTORY_TREE.md
 -->

<!-- DIRECTORY_TREE_START -->

```bash
/Users/kidustadesse/Code/Client-Management/client-management
├── AGENTS.md
├── amplify.yml
├── DIRECTORY_TREE.md
├── Distribute
│   └── distributeFiles.md
├── eslint.config.mjs
├── jsconfig.json
├── jsdoc.json
├── next.config.mjs
├── package-lock.json
├── package.json
├── prisma
│   ├── schema.prisma
│   └── seed.js
├── Project
│   ├── ApiService.md
│   ├── booking service
│   │   ├── plan.md
│   │   └── service.md
│   ├── CodeingRules.md
│   └── Pricing.md
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── README.md
├── src
│   ├── app
│   │   ├── about
│   │   │   ├── page.js
│   │   │   └── style.jsx
│   │   ├── admin
│   │   │   ├── clients
│   │   │   │   ├── [id]
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── style.jsx
│   │   │   │   ├── clients.style.jsx
│   │   │   │   ├── new
│   │   │   │   │   └── page.js
│   │   │   │   └── page.js
│   │   │   ├── invoices
│   │   │   │   ├── page.js
│   │   │   │   └── style.jsx
│   │   │   ├── page.js
│   │   │   ├── projects
│   │   │   │   ├── page.js
│   │   │   │   └── style.jsx
│   │   │   ├── reports
│   │   │   │   └── page.js
│   │   │   ├── settings
│   │   │   │   └── page.js
│   │   │   ├── style.jsx
│   │   │   └── tasks
│   │   │       └── page.js
│   │   ├── api
│   │   │   ├── admin
│   │   │   │   └── backfill
│   │   │   │       └── clients
│   │   │   │           └── route.js
│   │   │   ├── clients
│   │   │   │   ├── [id]
│   │   │   │   │   └── route.js
│   │   │   │   ├── route.js
│   │   │   │   ├── search
│   │   │   │   │   └── route.js
│   │   │   │   └── stats
│   │   │   │       └── route.js
│   │   │   ├── dashboard
│   │   │   │   ├── activity
│   │   │   │   │   └── route.js
│   │   │   │   ├── overview
│   │   │   │   │   └── route.js
│   │   │   │   ├── projects
│   │   │   │   │   └── route.js
│   │   │   │   ├── stats
│   │   │   │   │   └── route.js
│   │   │   │   └── tasks
│   │   │   │       └── route.js
│   │   │   ├── domain
│   │   │   │   └── search
│   │   │   │       └── route.js
│   │   │   ├── files
│   │   │   │   ├── [id]
│   │   │   │   │   ├── approve
│   │   │   │   │   │   └── route.js
│   │   │   │   │   └── request-revision
│   │   │   │   │       └── route.js
│   │   │   │   └── route.js
│   │   │   ├── invoices
│   │   │   │   ├── [id]
│   │   │   │   │   ├── mark-paid
│   │   │   │   │   │   └── route.js
│   │   │   │   │   ├── route.js
│   │   │   │   │   └── send
│   │   │   │   │       └── route.js
│   │   │   │   ├── overdue-check
│   │   │   │   │   └── route.js
│   │   │   │   ├── route.js
│   │   │   │   └── stats
│   │   │   │       └── route.js
│   │   │   ├── messages
│   │   │   │   └── route.js
│   │   │   ├── projects
│   │   │   │   ├── [id]
│   │   │   │   │   └── route.js
│   │   │   │   ├── route.js
│   │   │   │   ├── search
│   │   │   │   │   └── route.js
│   │   │   │   └── stats
│   │   │   │       └── route.js
│   │   │   ├── reports
│   │   │   │   └── route.js
│   │   │   ├── requests
│   │   │   │   └── project
│   │   │   │       └── route.js
│   │   │   ├── settings
│   │   │   │   ├── notifications
│   │   │   │   │   └── route.js
│   │   │   │   ├── profile
│   │   │   │   │   └── route.js
│   │   │   │   └── team
│   │   │   │       └── route.js
│   │   │   ├── storage
│   │   │   │   └── presign
│   │   │   │       └── route.js
│   │   │   ├── tasks
│   │   │   │   ├── [id]
│   │   │   │   │   ├── comments
│   │   │   │   │   │   └── route.js
│   │   │   │   │   ├── route.js
│   │   │   │   │   └── time-logs
│   │   │   │   │       └── route.js
│   │   │   │   ├── route.js
│   │   │   │   └── stats
│   │   │   │       └── route.js
│   │   │   └── webhooks
│   │   │       └── clerk
│   │   │           └── route.js
│   │   ├── contact
│   │   │   ├── page.js
│   │   │   └── style.jsx
│   │   ├── dashboard
│   │   │   ├── approvals
│   │   │   │   ├── [id]
│   │   │   │   │   └── page.js
│   │   │   │   └── page.js
│   │   │   ├── domains
│   │   │   │   └── page.js
│   │   │   ├── files
│   │   │   │   └── page.js
│   │   │   ├── invoices
│   │   │   │   ├── [id]
│   │   │   │   │   └── page.js
│   │   │   │   └── page.js
│   │   │   ├── messages
│   │   │   │   └── page.js
│   │   │   ├── page.js
│   │   │   ├── projects
│   │   │   │   ├── [id]
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── stye.jsx
│   │   │   │   ├── new
│   │   │   │   │   └── page.js
│   │   │   │   └── page.js
│   │   │   ├── schedule
│   │   │   │   └── page.js
│   │   │   ├── settings
│   │   │   │   └── page.js
│   │   │   ├── support
│   │   │   │   └── page.js
│   │   │   └── tasks
│   │   │       ├── [id]
│   │   │       │   └── page.js
│   │   │       └── page.js
│   │   ├── error.js
│   │   ├── favicon.ico
│   │   ├── layout.js
│   │   ├── not-found.js
│   │   ├── page.js
│   │   ├── pricing
│   │   │   ├── page.js
│   │   │   └── PricingPage.style.jsx
│   │   ├── sign-in
│   │   │   └── [[...sign-in]]
│   │   │       ├── page.js
│   │   │       └── style.jsx
│   │   ├── sign-out
│   │   │   └── [[...sign-out]]
│   │   │       └── page.js
│   │   ├── sign-up
│   │   │   └── [[...sign-up]]
│   │   │       ├── page.js
│   │   │       └── style.js
│   │   └── test
│   │       └── page.jsx
│   ├── components
│   │   ├── ErrorBoundary.js
│   │   ├── Footer
│   │   │   └── Footer.jsx
│   │   ├── forms
│   │   │   └── CreateClientForm.js
│   │   ├── layout
│   │   │   ├── AdminDashboardLayout.js
│   │   │   ├── AdminDashboardLayout.style.jsx
│   │   │   ├── ClientDashboardLayout.js
│   │   │   └── ClientDashboardLayout.style.jsx
│   │   ├── Navigation
│   │   │   ├── Navigation.jsx
│   │   │   └── Navigation.style.jsx
│   │   ├── ProjectSelector
│   │   │   ├── ProjectSelector.jsx
│   │   │   └── ProjectSelector.style.jsx
│   │   └── ui
│   │       ├── home.jsx
│   │       ├── index.jsx
│   │       ├── Loading.js
│   │       ├── Modal.js
│   │       ├── Search.js
│   │       └── Toast.js
│   ├── data
│   │   ├── appInfo.js
│   │   ├── navigation
│   │   │   └── links.js
│   │   └── page
│   │       ├── about
│   │       │   └── aboutData.js
│   │       ├── admin
│   │       │   ├── adminData.js
│   │       │   └── clientDetailTabs.js
│   │       ├── contact
│   │       │   └── contactData.js
│   │       ├── home
│   │       │   └── homeData.js
│   │       ├── invoices
│   │       │   └── invoicesData.js
│   │       ├── pricing
│   │       │   └── pricingData.js
│   │       └── sign-in
│   │           └── signinData.js
│   ├── lib
│   │   ├── api-helpers.js
│   │   ├── domain
│   │   │   └── domainSearch.js
│   │   ├── fileWriter.js
│   │   ├── prisma.js
│   │   ├── roleGuard.js
│   │   ├── storage
│   │   │   └── r2Config.js
│   │   └── utils.js
│   ├── middleware.js
│   ├── providers
│   │   ├── ProjectProvider.js
│   │   └── ThemeProvider.js
│   ├── registry.js
│   ├── styles
│   │   ├── global-styles.js
│   │   └── theme.js
│   └── validation
│       └── domain
│           └── schema.js
└── vercel.json

114 directories, 150 files
```

<!-- DIRECTORY_TREE_END -->
