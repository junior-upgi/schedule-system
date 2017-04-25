SELECT
    a.id
	,a.SAL_NO
	,b.NAME AS SALM_NAME
	,c.DEP
	,d.NAME AS DEPT_NAME
	,a.processTypeId
	,e.reference
	,e.deprecated
	,a.principle
FROM scheduleSystem.dbo.responsibility a
    LEFT JOIN DB_U105.dbo.SALM b ON a.SAL_NO=b.SAL_NO
    LEFT JOIN DB_U105.dbo.MF_YG c ON a.SAL_NO=c.YG_NO
    LEFT JOIN DB_U105.dbo.DEPT d ON c.DEP=d.DEP
    LEFT JOIN scheduleSystem.dbo.processType e ON a.processTypeId=e.id
WHERE a.deprecated IS NULL
    AND e.deprecated IS NULL;
