# Keep MSM Unit relationships on the Unit

MSM Units own unidirectional references to systemwide Cases and People, with many-to-many attribution resolved for MSM views at query time. We chose this over extending the existing bidirectional global Unit model because MSM-specific organization must not alter or couple the shared Case and Person documents used by other websites.
