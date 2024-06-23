import pymysql

__timeout = 10
__connection = pymysql.connect(
    charset="utf8mb4",
    connect_timeout=__timeout,
    cursorclass=pymysql.cursors.DictCursor,
    db="defaultdb",
    host="take-home-project-be-real-time-every-time.d.aivencloud.com",
    password="AVNS_EZqPcrqKPg-mXOF_SJl",
    read_timeout=__timeout,
    port=11595,
    user="avnadmin",
    write_timeout=__timeout,
)


def isUserExists(email: str):
    with __connection.cursor() as cursor:
        sql = "SELECT EXISTS(SELECT 1 FROM Users WHERE Email=%s) AS 'exists'"
        cursor.execute(sql, (email,))
        result = cursor.fetchone()
        exists = result["exists"]
    return bool(exists)


def getUser(email: str):
    with __connection.cursor() as cursor:
        sql = "SELECT Id, Email, AcPassword FROM Users WHERE Email=%s"
        cursor.execute(sql, (email,))
        result = cursor.fetchone()
    return result


def getUserId(email: str):
    with __connection.cursor() as cursor:
        sql = "SELECT Id FROM Users WHERE Email=%s"
        cursor.execute(sql, (email,))
        result = cursor.fetchone()
    return result


def setUser(firstname: str, lastname: str, email: str, password: str):
    with __connection.cursor() as cursor:
        sql = "INSERT INTO Users ( First_Name, Last_Name, Email, AcPassword) VALUES (%s, %s, %s, %s)"
        result = cursor.execute(sql, (firstname, lastname, email, password))
    __connection.commit()
    return bool(result)


def setBallPosition(x: float, y: float, z: float, userId: str):
    with __connection.cursor() as cursor:
        sql = "INSERT INTO Ball_Positions ( X, Y, Z, User_Id) VALUES (%s, %s, %s, %s)"
        result = cursor.execute(sql, (x, y, z, userId))
    __connection.commit()
    return bool(result)


def getBallPosition():
    with __connection.cursor() as cursor:
        sql = "SELECT X, Y, Z FROM Ball_Positions ORDER BY timestamp DESC LIMIT 1"
        cursor.execute(sql)
        result = cursor.fetchone()
    return result
