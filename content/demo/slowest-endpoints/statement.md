# Slowest endpoints in an access log

Each line of an access log reads `METHOD PATH STATUS MILLISECONDS`. Lines that do not have exactly four fields, or whose status or time is not a whole number, are skipped.

An endpoint is a method and a path together. Its median time is the middle value of its sorted times; for an even count it is the mean of the two middle values.

Print the `k` endpoints with the highest median, slowest first, ties broken by endpoint name in byte order. Print fewer when the log has fewer endpoints.

**Input.** The first line holds `k`. Every following line is a log line.

**Output.** One endpoint per line.
