    SELECT
        a.CUS_NO
	,b.SNM AS CUST_SNM
	,b.SAL AS SAL_NO
	,c.NAME AS SALM_NAME
	,a.email
	,a.telegramId
	,a.smartsheetId
	,a.enabled
	,1 AS existing
    FROM scheduleSystem.dbo.existingClient a
        INNER JOIN DB_U105.dbo.CUST b ON a.CUS_NO=b.CUS_NO
        INNER JOIN DB_U105.dbo.SALM c ON b.SAL=c.SAL_NO
UNION
    SELECT
        d.id AS CUS_NO
	,d.CUST_SNM
	,d.SAL_NO
	,e.NAME AS SALM_NAME
	,d.email
	,d.telegramId
	,d.smartsheetId
	,d.enabled
	,0 AS existing
    FROM scheduleSystem.dbo.newClient d
        INNER JOIN DB_U105.dbo.SALM e ON d.SAL_NO=e.SAL_NO;
