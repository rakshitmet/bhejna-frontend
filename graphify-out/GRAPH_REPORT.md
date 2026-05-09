# Graph Report - /home/rakshitbhai/bhejna-frontend  (2026-05-09)

## Corpus Check
- 31 files · ~26,824 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 96 nodes · 152 edges · 28 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]

## God Nodes (most connected - your core abstractions)
1. `toLocale()` - 12 edges
2. `localizeUrl()` - 11 edges
3. `paraglideMiddleware()` - 10 edges
4. `getStrategyForUrl()` - 9 edges
5. `resolveLocaleWithStrategies()` - 9 edges
6. `getLocale()` - 8 edges
7. `extractLocaleFromRequestWithStrategies()` - 8 edges
8. `extractLocaleFromRequestAsync()` - 8 edges
9. `deLocalizeUrl()` - 8 edges
10. `shouldRedirect()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `reroute()` --calls--> `deLocalizeUrl()`  [INFERRED]
  /home/rakshitbhai/bhejna-frontend/src/hooks.ts → /home/rakshitbhai/bhejna-frontend/src/lib/paraglide/runtime.js
- `handleParaglide()` --calls--> `paraglideMiddleware()`  [INFERRED]
  /home/rakshitbhai/bhejna-frontend/src/hooks.server.ts → /home/rakshitbhai/bhejna-frontend/src/lib/paraglide/server.js
- `getStrategyForUrl()` --calls--> `paraglideMiddleware()`  [INFERRED]
  /home/rakshitbhai/bhejna-frontend/src/lib/paraglide/runtime.js → /home/rakshitbhai/bhejna-frontend/src/lib/paraglide/server.js
- `isExcludedByRouteStrategy()` --calls--> `paraglideMiddleware()`  [INFERRED]
  /home/rakshitbhai/bhejna-frontend/src/lib/paraglide/runtime.js → /home/rakshitbhai/bhejna-frontend/src/lib/paraglide/server.js
- `overwriteServerAsyncLocalStorage()` --calls--> `paraglideMiddleware()`  [INFERRED]
  /home/rakshitbhai/bhejna-frontend/src/lib/paraglide/runtime.js → /home/rakshitbhai/bhejna-frontend/src/lib/paraglide/server.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.17
Nodes (15): defineCustomClientStrategy(), defineCustomServerStrategy(), extractLocaleFromRequestAsync(), findMatchingRouteStrategy(), getLocale(), getLocaleForUrl(), getStrategyForUrl(), isCustomStrategy() (+7 more)

### Community 1 - "Community 1"
Cohesion: 0.29
Nodes (12): assertIsLocale(), defaultUrlPatternExtractLocale(), extractLocaleFromCookie(), extractLocaleFromHeader(), extractLocaleFromNavigator(), extractLocaleFromRequest(), extractLocaleFromRequestWithStrategies(), extractLocaleFromUrl() (+4 more)

### Community 2 - "Community 2"
Cohesion: 0.23
Nodes (11): reroute(), aggregateGroups(), deLocalizeHref(), deLocalizeUrl(), deLocalizeUrlDefaultPattern(), fillMissingUrlParts(), fillPattern(), generateStaticLocalizedUrls() (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.31
Nodes (6): handleParaglide(), overwriteServerAsyncLocalStorage(), cloneRequestWithFallback(), createMockAsyncLocalStorage(), paraglideMiddleware(), resolveMiddlewareUrl()

### Community 4 - "Community 4"
Cohesion: 0.47
Nodes (2): getSupabase(), POST()

### Community 5 - "Community 5"
Cohesion: 0.6
Nodes (3): number(), plural(), relativetime()

### Community 6 - "Community 6"
Cohesion: 1.0
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 6`** (2 nodes): `hello_world()`, `en.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (2 nodes): `hello_world()`, `es.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (2 nodes): `hello_world()`, `de.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (2 nodes): `hello_world()`, `ch.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (2 nodes): `+layout.ts`, `load()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (2 nodes): `+layout.server.ts`, `load()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (2 nodes): `+page.server.ts`, `load()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `svelte.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `app.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `supabase.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `messages.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `_index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `+layout.svelte`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `+page.svelte`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `+page.svelte`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `+page.server.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `+page.svelte`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `+page.svelte`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `+page.svelte`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `paraglideMiddleware()` connect `Community 3` to `Community 0`, `Community 2`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `deLocalizeUrl()` connect `Community 2` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `paraglideMiddleware()` (e.g. with `handleParaglide()` and `overwriteServerAsyncLocalStorage()`) actually correct?**
  _`paraglideMiddleware()` has 6 INFERRED edges - model-reasoned connections that need verification._