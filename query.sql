-- ARRAY AGREGATE GROUP BY
SELECT projectid, ARRAY_AGG(userid)
FROM members
GROUP BY projectid

SELECT * FROM members JOIN projects ON (members.projectid = 14 AND projects.projectid = 14) 
JOIN users ON members.userid = users.userid