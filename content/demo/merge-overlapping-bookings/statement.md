# Merge overlapping bookings

A meeting room's bookings arrive as start and end minutes since midnight, in no particular order. Two bookings that overlap or touch (one ends the minute the other starts) belong to one block.

Print the blocks sorted by start, one per line.

**Input.** The first line holds `n`. Each of the next `n` lines holds a start and an end.

**Output.** One line per block, start then end. Print nothing when there are no bookings.
