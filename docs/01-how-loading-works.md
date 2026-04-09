# How Page Loading Works

## The Big Picture

This app uses **htmx** to load content dynamically without full page reloads. Think of it like a Single Page App (SPA) but simpler.

## Step-by-Step Flow

### 1. User visits the site
```
Browser loads index.html
```

### 2. index.html looks like this:
```html
<main>
  <div id="app" 
       hx-get="partials/home.html"
       hx-trigger="load">
  </div>
</main>
```

The `#app` div has `hx-get` and `hx-trigger="load"` - this means "as soon as the page loads, fetch partials/home.html and put it inside me".

### 3. htmx fetches home.html and injects it
```
htmx request → GET partials/home.html
htmx response → Inject HTML into #app
```

### 4. main.js fires htmx:afterSwap event
```javascript
document.body.addEventListener("htmx:afterSwap", onAfterSwap);
```

This is where the magic happens - after htmx swaps content into `#app`, main.js checks what page we're on and initializes it.

### 5. Detecting which page loaded
```javascript
function onAfterSwap(evt) {
  const app = evt.detail.target;  // This is #app
  
  const homePage = app.querySelector('#home-page');
  if (homePage) {
    initHomePage();   // We're on home
    return;
  }
  
  const algoPage = app.querySelector('#algo-page');
  if (algoPage) {
    initAlgorithmPage();  // We're on an algorithm
  }
}
```

## Two Types of Pages

### Home Page (`partials/home.html`)
- Shows the "DAA Lab Project" header
- Displays all 9 algorithm cards in a grid
- Each card links to `#/algo/{slug}` like `#/algo/mst`

### Algorithm Page (`partials/algo-layout.html`)
- Loaded when you click an algorithm card
- Has input form, canvas/workspace for visualization
- Has Run/Step/Reset buttons
- Has sidebar for results, logs, complexity

## URL Routing

The URL changes when you navigate:
- Home: `#/home` or just `/`
- Algorithm: `#/algo/{slug}` e.g., `#/algo/mst`

This is handled by htmx attributes on the links:
```html
<a href="#/algo/mst" 
   hx-get="partials/algo-layout.html?algo=mst"
   hx-target="#app"
   hx-push-url="#/algo/mst">
```

- `hx-get` - what to fetch
- `hx-target` - where to put it (#app)
- `hx-push-url` - update browser URL

## Summary

| What Happens | Who Does It |
|-------------|------------|
| Page loads | Browser |
| Fetch home.html | htmx |
| Inject into #app | htmx |
| Initialize home/algo page | main.js |