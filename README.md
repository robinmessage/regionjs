CSS3 Regions in Javascript
==========================

N.B. This is an incomplete, buggy, trial implementation that doesn't even obey the spec.

Introduction
------------

When I say Adobe's CSS regions prototype, I thought, "surely you don't need a whole browser fork to implement that."

It turns out, you do. But, I have implemented the story threading part, which you can see in Adobe's own demonstrations here, here and here.

Next step is to implement some of the exclusions module, as these modules work quite well together.

With the approach I've taken, special styling rules are not needed -- just set styles within the regions as you would normally.

Performance
-----------
Slightly laggy on resizing, but not particularly noticable. Could always reflow after a resize.

Implementation
--------------
Uses jquery (although only a little, I can't be bothered to work around browser bugs myself). The Adobe examples are manually soft-hyphenated; a real solution would maybe use hyphenator or something similar, or do hyphenation on the server-side. As long as you hyphenate first, it'll work fine.

We fill each region until it overflows, then we cut the HTML up until it fits, then we continue into the next region and so on. The last region is allowed to overflow, so set overflow: hidden if that will look bad.

Instead of using custom CSS features, you mark a story to be flowed with the CSS class "regioned" and add the custom attribute "region" to name the flow. Regions that can have flow go into them are labelled with the CSS class "region", immediately followed by the name of the region (e.g. A div with class regioned and region main-story will flow into all elements with a class that contains "region main-flow".) Obviously, this is a little hacky -- any better suggestions appreciated.

Todo
----

- Everything!
- Add support for exclusions.
- Check browser support.
