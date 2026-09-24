# Notes

## Search vs. category filter

DummyJSON can't do both at once — `/products/search?q=` ignores category, and
`/products/category/:slug` ignores the search term. Rather than silently
picking one, the app disables the category dropdown as soon as there's a
search term (with a tooltip explaining why), and search always takes
priority in the fetch logic. Clearing the search box re-enables the category
filter. This felt more honest than quietly dropping one of the two filters
without telling the user, and simpler than trying to fake a combined filter
by fetching a whole category and filtering client-side (which breaks
pagination totals).

## Add / edit / delete "aren't really saved"

The DummyJSON write endpoints return a success response with sensible-looking
data, but a follow-up `GET` shows the old, unchanged data — nothing persists
on their server. So the app still calls the real endpoint first (to
demonstrate the request/response cycle correctly), and then records the same
change in a small `localStorage` overlay (`lib/localOverrides.js`): added
products are stored in full, edits are stored as a patch keyed by id, and
deletes are stored as a list of hidden ids. Every list/detail fetch merges
the API response with this overlay before rendering. This means the change
survives a refresh (a plain in-memory store wouldn't), which felt closer to
what a real admin tool should do, while being upfront in the README about it
being a client-side simulation rather than real persistence.

## Handling fast typing / race conditions

Two things had to work together: debouncing the input (so we're not firing a
request per keystroke) and making sure an old, slow request can't overwrite
a newer one's results if it resolves later. I debounce the search value
before it's used in the fetch, and separately guard the fetch itself with
both an `AbortController` (cancels the in-flight request when a new one
starts) and a request-id counter (belt-and-braces, in case a response
manages to resolve just as a newer request starts). I tested this with
`&delay=2000` appended to the API calls in `lib/api/products.js` temporarily,
typing a query, then quickly clearing it — without the guard, the slow
"non-empty query" response would land after the fast "empty query" one and
show stale results.

## One problem I ran into, and how I fixed it

Cancelled Axios requests were being swallowed by the shared error
interceptor in `lib/axios.js` and turned into a generic "Something went
wrong" error, because the interceptor rejects every failed request with the
same `{ message, status }` shape. That meant every time a stale search
request was cancelled, the UI would flash an error state for a moment before
the real (successful) response replaced it. The fix was to check
`axios.isCancel(error)` at the very top of the interceptor and reject with
an `{ isCancelled: true }` marker instead, so callers can recognize a
cancellation and simply ignore it rather than treating it as a failure.

## Where AI helped

I used AI assistance to scaffold the repetitive parts — the CRUD API
wrapper functions, the pagination page-number logic (the "1 ... 4 5 6 ... 20"
list), and first drafts of the Tailwind markup for each component — then
went through and adjusted the parts specific to this assignment's rules
(the search/category mutual exclusion, the local-overlay approach for
writes, the debounce + cancellation combination, and the URL-state
handling). I can walk through and explain any part of it, and I'm happy to
make live changes to it in review.
