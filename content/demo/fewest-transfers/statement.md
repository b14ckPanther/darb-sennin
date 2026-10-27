# Fewest transfers between stations

A rail network has numbered lines; each line is a list of stations it stops at. Riding a line between any two of its stops costs nothing; changing lines costs one transfer.

Print the fewest transfers needed to get from station `from` to station `to`, or `-1` when it cannot be done. Staying on the first line you board costs zero, and being there already costs zero.

**Input.** The first line holds `m`, `from` and `to`. Each of the next `m` lines starts with a count `c` followed by `c` stations.

**Output.** One integer.
