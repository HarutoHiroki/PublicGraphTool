# Demo Page
https://graphtool-demo.harutohiroki.com/

# Changes
- Added Equalizer (cred to Rohsa)
- Added Uploads
- Added Targets
- Added Website link on graph (cred to MRS)
- Re-themed graph window
- Re-done Frequency Range definitions
- Changed parser to universal parser
- Removed Restricted mode (cuz I want to keep it free)
- Reorganised code
- Moved targets to a different folder for organization
- Moved phone_book outside for easier access (reverted for squiglink compatibility)
- Added a function to average all active graphs (requested by listener)
- Custom Diffuse Field Tilt (requested by listener)
- Restyled EQ tab
- EQable pink noise in EQ tab (requested by listener)
- Added the ability to upload your own test track to EQ (requested by rollo)
- Added a button to disable and enable all EQ bands (requested by SK)
- Tone generator now EQable (requested by SK)
- Added a Channel balance slider
- Added a song progress slider to the EQ demo section (requested by XiaoShe)
- Added Ear Gain customisation to custom tilt (requested by listener)
- Made any target tiltable (requested by listener)
- Added Treble customisation to custom tilt (requested by listener)
- Added a button to swap between different y-axis scales (requested by rollo)
- Added Preference Bounds and Preference Bound scaling (requested by listener)
- Reversed the "any target tiltable" feature, now applying tilt on target automatically if supported (requested by listener)
- Per-measurement compensation (requested by listener)
- Added support for Haruto's Graph Extension to apply eq to browserwide 
- Made Preference Bounds better and not relying on a png anymore
- Downloadable CSV of all active graphs
- Per page Y scaling (requested by listener)
- Added a Graph Customisation menu
- Added Translations (Thanks to potatosalad775) (removed for now due to not having enough translations, will be added back soon)
- Added the 90% Inclusion Zone feature (requested and long awaited by the community)

# TODO
- Implement a way to measure the SPL of an IEM and decide whether to upload it or not, skipping REW
  - ability to select which mic/output to use
  - ability to select calibration files
  - ability to apply smoothing
- Trace Arithmetic
- Realtime Analysis
- EQ upload to hardware

# Contributors
<a href="https://github.com/HarutoHiroki/PublicGraphTool/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=HarutoHiroki/PublicGraphTool&max=15">
</a>

# P.S.
- If you do implement code in here, do leave credits to the original author (me) and the contributors (Rohsa, MRS, potatosalad775)

# The In-Ear Graphing Library

If you're not weirdly obsessed with headphones you can leave at any time.

Crinacle is a reviewer famous around the world (at least, I'm on the
opposite side of it as he is) for his extensive reviews and measurements
of in-ear monitors (IEMs). CrinGraph is the tool which allows readers to
compare measurements against each other, and save easily readable images
to share around the internet. Although it was designed for
[Crin's site](https://crinacle.com/graphs/graphtool/),
the code here can be used freely by anyone, with no restrictions.
There are now many instances, including
[Banbeucmas](https://banbeu.com/graph/tool/),
[HypetheSonics](https://www.hypethesonics.com/iemdbc/),
[Rohsa](https://rohsa.gitlab.io/graphtool/), and
[Super\* Review](https://squig.link/), which has links to even more of
them. If you're interested in using it for your own graphs, see
[Configuring.md](Configuring.md) and ask me about any questions that
come up.

### What are the squiggles?

If you want the whole story, there's no choice but to get it from
[the man himself](https://crinacle.com/2020/04/08/graphs-101-how-to-read-headphone-measurements/).
5,000 words and you'll still be disappointed when it's over.

The most informative headphone measurement, and the only one handled by
this tool, is the frequency response (FR) graph. An FR graph shows how
loud the headphone will render sounds at different pitches. The higher
the left portion of the graph, the more your brain will rattle; the
higher the right portion of the graph, the more your ears will bleed.
The current industry standard is a "V-shaped" response which applies
both conditions at once. Using an FR graph you may easily see which
headphones conform to this standard and which are insufficiently "fun".

### Sample graphs

This repository includes some sample data so that the tool can be shown
through Github pages. Sometimes I use this to show people features
before they're adopted on Crin's site.

[View some sample graphs.](https://mlochbaum.github.io/CrinGraph/graph.html)

Because Crinacle's frequency response measurements are not public, the
sample response curves shown are synthesized. They are not real
headphones and you can't listen to them. To reduce potential
disappointment, steps have been taken to ensure that the curves are as
uninviting as possible. Any resemblance to the exports of a large East
Asian county is purely coincidental.

## Features

If you want one that's not here, just ask so I can explain why it's a
bad idea.

### Layout

The graph tool displays:
* A **graph window** at the top
* The **toolbar** just below it
* The **selector** at the bottom left, or below the toolbar for narrow windows
* A **target selector**
* The **manager** for active curves

### Graph window

* Standard logarithmic frequency (Hz) and sound pressure level (dB) [axes](Documentation.md#axes)
* [Colors](Documentation.md#colors) are persistent and algorithmically generated to ensure contrast
* Use the slider at the left to rescale and adjust the y axis
* [Hover](Documentation.md#highlight-on-mouseover) over or click a curve to see its name and highlight it in the manager

### Toolbar

* Zoom into bass, mid, or treble frequencies
* [Normalize](Documentation.md#normalization) with a target loudness or a normalization frequency
* [Smooth](Documentation.md#smoothing) graphs with a configurable parameter
* Toggle inspect mode to see the numeric response values when you mouse over the graph
* [Label](Documentation.md#labelling) curves inside the graph window
* Save a png [screenshot](Documentation.md#screenshot) of the graph (with labels)
* Recolor the active curves in case there is a color conflict
* Toolbar collapses and expands, along with the target selector, when the screen is small

### Headphone and target selectors

* Headphones are grouped by brand: select brands to narrow them down
* Click to select one headphone or brand and unselect others; middle or ctrl-click for non-exclusive select
* [Search](Documentation.md#searching) all brands or headphones by name
* Targets are selected the same way but are independent from headphones

### Headphone manager

* Curve names and colors are displayed here
* Choose and compare variant measurements of the same model with a dropdown
* Use the wishbone-shaped selector to see left and/or right channels or [average](Documentation.md#averaging) them together
* A red exclamation mark indicates that channels are [imbalanced](Documentation.md#channel-imbalance-marker)
* Change the offset to move graphs up and down (after [normalization](Documentation.md#normalization))
* Select [BASELINE](Documentation.md#baseline) to adjust all curves so the chosen one is flat
* Temporarily hide or unhide a graph
* PIN a headphone to avoid losing it while adding others
* Click the little dots at the bottom left to change a single headphone's [color](Documentation.md#colors)

## Contact

File a Github issue here for topics related to the project. You can also
reach me by the email in my Github profile and the [LICENSE](LICENSE).
I can sometimes be found on
[Crin's Discord server](https://discord.gg/CtTqcCb) where I am
creatively named Marshall.
