# OCF Coding Challenge - August 2022

Working from a standard [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### ☁️ &nbsp; Deployment

Deployed to [Vercel](https://vercel.com/), mainly because it's so easy with Next.js, but could just as easily have been Netlify, Render, etc.


### 💻 &nbsp; Local

To start locally:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Overview

### National Daily Forecast
- Can select date in datepicker to see forecast different dates

### Regional Forecast
- Can select date in datepicker to see forecast for that date for selected regions
- Can select two regional forecasts to compare in the stacked graphs


## Comments/Caveats

- Lots of frontend filtering/data manipulation is done in the browser here, obviously not ideal for production but fine under the context and time constraints, and the load times/changing date etc. seem to be okay on my end.
- Also not my prettiest UI (or code, probably) but hopefully it works and is easy enough to understand 😅
