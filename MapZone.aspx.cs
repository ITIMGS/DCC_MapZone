using System;
using System.Web.UI;
using System.Configuration;
using System.Text;
using System.Data;
using System.Data.OleDb;
using System.Web.Services;
using System.Data.SqlClient;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Web.Script.Serialization;

public partial class MapZone : System.Web.UI.Page
{
    /*Variables*/
    public string m_sFooterInfo = "";

    public string m_sFooterHyperlink = "";

    public string m_sFooterLinkText = "";

    public string m_sCompanyName = "";

    public string m_sMapName = "";
    /*Stored Procedures and Parameters*/
    private static string SP_SEARCHTEXT = "usp_SearchText";
    private static string SP_GetLayer = "usp_GetFreeTextLayer";
    private static string PARAM_TABLE= "@Table";
    private static string PARAM_COL = "@Column";
    private static string PARAM_TEXT = "@FindText";
    private static string PARAM_MAPNAME = "@mapName";
    private static string PARAM_SEARCHCOL = "@searchColumn";
    private static string PARAM_VALUE = "@value";
    private static string PARAM_DBTABLE = "@dbtable";
    private string sMapName = "";
    private static string mapName = "";
    private string stenantCon = "";
    private static string SP_GETRELATEDTOOLTIP = "usp_RelatedRecords";
    private static string PARAM_INPUTVALUE = "@inputValue";
	private static string PARAM_DBNAME= "@fdbName";




    protected void Page_Load(object sender, EventArgs e)
    {
        System.Data.OleDb.OleDbConnection oManagementConnection = null;
        string sManagementDBConnection = "";
        System.Data.OleDb.OleDbConnection oTenantConnection = null;
        
        string sReplaceLOCALHOST = "";
        string sTenantProvider = "";
        string sTenantConnectionSQL = "";
        string sLayersConnectionSQL = "";
        string sFreeTextSearchScript = "";
        System.Data.OleDb.OleDbCommand oCommand = null;
        OleDbDataReader oReader = null;
        System.Data.OleDb.OleDbCommand oLayerCommand = null;
        OleDbDataReader oLayerReader = null;
        string sTenant = "";
        string sTenantDBConnection = "";
		 string sFreetextTable = "";
        string sFreeTextColumn = "";
        string sFreeTextDetails = "";
        string  authUrl = "";
        string userName  ="";
        string password ="";
        string TenantName ="";

        string sWMSURL = "";
        Type cstype = Page.GetType();
        string sLayerInfo = "";
        StringBuilder sGetAPIURLScript = new StringBuilder();
        StringBuilder sGetTenantNameScript = new StringBuilder();
        StringBuilder sGetLayerInfoScript = new StringBuilder();
		StringBuilder sGetFreeTextLayerTable = new StringBuilder();
		StringBuilder sGetUserName = new StringBuilder();
        StringBuilder sGetPassword = new StringBuilder();
        StringBuilder sTenantName = new StringBuilder();
        StringBuilder sAuthUrl= new StringBuilder();


        try
        {
            sManagementDBConnection = ConfigurationManager.AppSettings["MasterEnterpriseDatabaseConnection"].ToString();
            sReplaceLOCALHOST = ConfigurationManager.AppSettings["ReplaceLOCALHOST"].ToString();
            sWMSURL = ConfigurationManager.AppSettings["WMSURL"].ToString();
            sMapName =Request.QueryString["map"].ToUpper(); //Session["MapName"].ToString().ToUpper();
            sTenant = ConfigurationManager.AppSettings["TenantName"].ToUpper();
            m_sCompanyName = ConfigurationManager.AppSettings["CompanyName"].ToString();
			sFreetextTable = ConfigurationManager.AppSettings["FreeTextTable"].ToString();
            sFreeTextColumn = ConfigurationManager.AppSettings["FreeTextColumn"].ToString();
            m_sMapName = sMapName;
            mapName = sMapName;
            authUrl = ConfigurationManager.AppSettings["authUrl"].ToString();
            userName = ConfigurationManager.AppSettings["userName"].ToString();
            password = ConfigurationManager.AppSettings["password"].ToString();
            TenantName = ConfigurationManager.AppSettings["TenantName"].ToString();
            m_sFooterInfo = ConfigurationManager.AppSettings["FooterInfo"];
            m_sFooterHyperlink = ConfigurationManager.AppSettings["FooterLink"];
            m_sFooterLinkText = ConfigurationManager.AppSettings["FooterLinkText"];
            sGetAPIURLScript.Append("<script type=\"text/javascript\"> function GetApiURL() { ");
            sGetTenantNameScript.Append("<script type=\"text/javascript\"> function GetTenantName() { ");
            sGetLayerInfoScript.Append("<script type=\"text/javascript\"> function GetLayerInfo() { ");
			sGetFreeTextLayerTable.Append("<script type=\"text/javascript\"> function GetFreeTextTable(){");
			sGetUserName.Append("<script type=\"text/javascript\"> function GetUserName(){");
            sFreeTextDetails = "select * from " + sFreetextTable + " where " + sFreeTextColumn + " =";
            sGetPassword.Append("<script type=\"text/javascript\"> function GetPassword(){");
            sTenantName.Append("<script type=\"text/javascript\"> function GetTenant(){");
            sAuthUrl.Append("<script type=\"text/javascript\"> function GetAuthUrl(){");
            try
            {
                sAuthUrl.Append(("return \'"
                               + (authUrl + "\';")));
            }
            catch
            {

            }
            try
            {
                sTenantName.Append(("return \'"
                               + (TenantName + "\';")));
            }
            catch
            {

            }
            try
            {
                sGetPassword.Append(("return \'"
                               + (password + "\';")));
            }
            catch(Exception ex)
            {

            }

            try
            {
                sGetAPIURLScript.Append(("return \'"
                                + (sWMSURL + "\';")));
            }
            catch (Exception ex)
            {
            }

            try
            {
                sGetTenantNameScript.Append(("return \'"
                                + (sTenant + "\';")));
            }
            catch (Exception ex)
            {
            }
			  try
            {
                sGetFreeTextLayerTable.Append(("return \'"
                                + (sFreeTextDetails + "\';")));
            }
            catch (Exception ex)
            {
            }

            try
            {
                sGetLayerInfoScript.Append("var oLayerInfo = [];");
                sGetLayerInfoScript.Append("function LayerInfo(name, srid, bbox, isvisible,maxSCALE,minSCALE,layerid, mytooltip, token){this.name = name;this.srid" +
                    " = srid;this.bbox = bbox;this.isvisible = isvisible;this.maxSCALE=maxSCALE;this.minSCALE=minSCALE;this.layerid = layerid;this.mytooltip = mytoolti" +
                    "p;this.token = token;}");
            }
            catch (Exception ex)
            {
            }
			try{
			sGetUserName.Append(("return \'"
                                + (userName + "\';")));
				
			}
			catch{}
			

            oManagementConnection = new OleDbConnection(sManagementDBConnection);
            if ((oManagementConnection == null))
            {
                return;
            }

            oManagementConnection.Open();
            sTenantConnectionSQL = "select a.DATASOURCE,a.CONNECTIONSTRING " +
            "from [dbo].[MAPP_CONNECTION] a, " +
            " ( " +
            "   SELECT [CONNECTION_ID],[NAME] " +
            "   FROM [dbo].[MAPP_TENANT] " +
            " ) b " +
            ("where UPPER(b.[NAME]) = \'"
                        + (sTenant + "\' ")) +
            "and a.[ID] = b.[CONNECTION_ID] ";
            oCommand = new OleDbCommand(sTenantConnectionSQL, oManagementConnection);
            if ((oCommand == null))
            {
                return;
            }

            oReader = oCommand.ExecuteReader();
            if ((oReader == null))
            {
                return;
            }

            while (oReader.Read() == true)
            {
                try
                {
                    sTenantDBConnection = oReader["CONNECTIONSTRING"].ToString();
                    stenantCon = sTenantDBConnection;
                    if ((string.IsNullOrEmpty(sReplaceLOCALHOST) == false))
                    {
                        //  I put this in as I am coding from another machine (where localhost is not available for the DB)
                        sTenantDBConnection = sTenantDBConnection.Replace("LOCALHOST", sReplaceLOCALHOST);
                    }

                    //  add the provider
                    switch (oReader["DATASOURCE"].ToString())
                    {
                        case "SqlServer":
                            sTenantProvider = "Provider=SQLOLEDB;";
                            break;
                        default:
                            sTenantProvider = "Provider=SQLOLEDB;";
                            break;
                    }
                    sTenantDBConnection = (sTenantProvider + sTenantDBConnection);
                    oTenantConnection = new OleDbConnection(sTenantDBConnection);
                    if ((oTenantConnection == null))
                    {
                        return;
                    }

                    oTenantConnection.Open();
                    //  read the layers (for the public maps, the layers also have to be myGeoServices)
                    sLayersConnectionSQL = "select h.name " +
                    "  , d.srid " +
                    "  , c.isvisible " +
                    "  , d.MAXSCALE"+
                    "  , d.MINSCALE"+
                    "  , a.[LAYER_ID]  " +
                    "  , b.[MINX],b.[MINY],b.[MAXX],b.[MAXY]  " +
                    "  , i.[TOOLTIP]  " +
                    "  , \'\' token  " +
                    "from [dbo].[MAPP_LEGEND_LAYER] a " +
                    ("  , (select [legend_id],[MINX],[MINY],[MAXX],[MAXY] from [dbo].[MAPP_MAPVIEW] where UPPER(NAME) = \'"
                                + (sMapName + "\') b ")) +
                    "  , [dbo].[MAPP_LAYER] c " +
                    "  , [dbo].[MAPP_DATASET] d " +
                    "  , [dbo].[MAPP_LEGEND_LAYER] e " +
                    "  , [dbo].[MAPP_VECTOR] f " +
                    "  , [dbo].[MAPP_MAPSERVICE_VECTOR] g " +
                    "  , [dbo].[MAPP_MAPSERVICE] h " +
                    "  , [dbo].[MAPP_VECTOR] i " +
                    "where a.[LEGEND_ID] = b.[LEGEND_ID] " +
                    "and  (a.[LEGEND_ID] = e.[LEGEND_ID] and a.[LAYER_ID] = e.[LAYER_ID]) " +
                    "and  a.[LAYER_ID] = c.[ID] " +
                    "and  c.[DATASET_ID] = d.[ID] " +
                    "and  c.[DATASET_ID] = f.[DATASET_ID] " +
                    "and  c.[DATASET_ID] = g.[DATASET_ID] " +
                    "and  h.[ID] = g.[SERVICE_ID] " +
                    "and  c.[DATASET_ID] = i.[DATASET_ID] " +
                    //"and  c.[ISVISIBLE] = 1 " +
                    "order by a.levelindex; ";
                    oLayerCommand = new OleDbCommand(sLayersConnectionSQL, oTenantConnection);
                    if ((oLayerCommand == null))
                    {
                        return;
                    }

                    oLayerReader = oLayerCommand.ExecuteReader();
                    if ((oLayerReader == null))
                    {
                        return;
                    }
                    /**comments*/
                    string sBBOX = "";
                    string sName = "";
                    string sSRID = "";
                    string IsIvisible = "";
                    string sLayerID = "";
                    string sTooltip = "";
                    string aAPITokey = "";
                    string sJS = "";
                    string minSCALE = "";
                    string maxSCALE = "";
                    
                    while (oLayerReader.Read())
                    {

                        try
                        {
                            try
                            {
                                sBBOX = ("\'"
                                            + (oLayerReader["MINX"] + (", "
                                            + (oLayerReader["MINY"] + (", "
                                            + (oLayerReader["MAXX"] + (", "
                                            + (oLayerReader["MAXY"] + "\'"))))))));
                                sName = ("\'"
                                            + (oLayerReader["name"] + "\'"));
                                sSRID = ("\'"
                                            + (oLayerReader["srid"] + "\'"));
                                IsIvisible = ("\'"
                                            + (oLayerReader["isvisible"] + "\'"));
                                maxSCALE = ("\'"
                                            + (oLayerReader["MAXSCALE"] + "\'"));
                                minSCALE= ("\'"
                                            + (oLayerReader["MINSCALE"] + "\'"));
                                sLayerID = ("\'"
                                            + (oLayerReader["LAYER_ID"] + "\'"));
                                aAPITokey = ("\'"
                                            + (oLayerReader["token"].ToString().Replace("\'", "") + "\'"));
                                sTooltip = oLayerReader["TOOLTIP"].ToString();
                                sTooltip = sTooltip.Replace("{ENTITY.", "*[");
                                sTooltip = sTooltip.Replace("}", "]*");
                                // sTooltip = sTooltip.Replace("<p>", "*ps*")
                                // sTooltip = sTooltip.Replace("</p>", "*pe*")
                                sTooltip = sTooltip.Replace("\"", "");
                                sTooltip = sTooltip.Replace("&", "");
                                // sTooltip = sTooltip.Replace("nbsp;", "")
                                sTooltip = sTooltip.Replace("vbLf", "");
                                sTooltip = sTooltip.Replace("\r", "").Replace("\n", "");
                                sTooltip = sTooltip.Replace("lt;", "<");
                                sTooltip = sTooltip.Replace("gt;", ">");
                                sTooltip = sTooltip.Replace("\'", "|");
                                sTooltip = ("\'"
                                            + (sTooltip + "\'"));
                                sJS = ("oLayerInfo.push(new LayerInfo("
                                            + (sName + (","
                                            + (sSRID + (","
                                            + (sBBOX + (","                                           
                                            + (IsIvisible + (","
                                            + (maxSCALE + (","
                                            + (minSCALE + (","                                           
                                            + (sLayerID + (","
                                            + (sTooltip + (","
                                            + (aAPITokey + "));"))))))))))))))))));
                                sGetLayerInfoScript.Append(sJS);
                            }

                            catch (Exception ex)
                            {
                            }
                        }
                        catch (Exception ex)
                        {
                        }
                    }
                    oLayerReader.Close();

                 

                }
                catch (Exception ex)
                {

                }
                finally
                {
                    if (oTenantConnection == null)  //== false))
                    {
                        try
                        {
                            oTenantConnection.Close();
                        }
                        catch (Exception ex)
                        {
                        }

                        oTenantConnection = null;
                    }
                    try
                    {
                        sGetLayerInfoScript.Append("return oLayerInfo;");
                    }
                    catch (Exception ex)
                    {
                    }

                }
            }
            oReader.Close();
            try
            {
            

                

            }
            catch(Exception ex)
            {

            }
        }

        catch (Exception ex)
        { }
        finally
        {

            if (oManagementConnection == null)

            {
                try
                {
                    oManagementConnection.Close();
                }
                catch (Exception ex)
                {
                }

                oManagementConnection = null;
            }

            try
            {
                sGetAPIURLScript.Append("} </script>");
                Page.ClientScript.RegisterStartupScript(cstype, Guid.NewGuid().ToString(), sGetAPIURLScript.ToString(), false);
            }
            catch (Exception ex)
            {
            }

            try
            {
                sGetTenantNameScript.Append("} </script>");
                Page.ClientScript.RegisterStartupScript(cstype, Guid.NewGuid().ToString(), sGetTenantNameScript.ToString(), false);
            }
            catch (Exception ex)
            {
            }

            try
            {
                sGetLayerInfoScript.Append("} </script>");
                Page.ClientScript.RegisterStartupScript(cstype, Guid.NewGuid().ToString(), sGetLayerInfoScript.ToString(), false);
            }
            catch (Exception ex)
            {
            }
           try
            {
                sGetFreeTextLayerTable.Append("} </script>");
                Page.ClientScript.RegisterStartupScript(cstype, Guid.NewGuid().ToString(), sGetFreeTextLayerTable.ToString(), false);


            }
            catch(Exception ex)
            {

            }
            try
            {


                sGetUserName.Append("} </script>");
                Page.ClientScript.RegisterStartupScript(cstype, Guid.NewGuid().ToString(), sGetUserName.ToString(), false);
            }
            catch (Exception ex)
            { }
            try {

                sGetPassword.Append("} </script>");
                Page.ClientScript.RegisterStartupScript(cstype, Guid.NewGuid().ToString(), sGetPassword.ToString(), false);
            }
            catch { }
            try
            {
                sTenantName.Append("} </script>");
                Page.ClientScript.RegisterStartupScript(cstype, Guid.NewGuid().ToString(), sTenantName.ToString(), false);
            }
            catch { }
            try
            {

                sAuthUrl.Append("} </script>");
                Page.ClientScript.RegisterStartupScript(cstype, Guid.NewGuid().ToString(), sAuthUrl.ToString(), false);
            }
            catch
            {

            }


        }
      

    }


    /// <summary>
    ///     /*Takes the input value entered by the User in the textbox and returns matching values*/
    /// </summary>
    /// <param name="request"></param>
    /// <returns></returns>
    [WebMethod]
    public static List<string> Freetextsearch(string request)
    { 
        string tableName = ConfigurationManager.AppSettings["FreeTextTable"].ToString();
        string columnName = ConfigurationManager.AppSettings["FreeTextColumn"].ToString();
        SqlConnection sqlcn = new SqlConnection(ConfigurationManager.ConnectionStrings["Dbconnection"].ConnectionString);
   
       
        List<string> itemList = new List<string>();

        try
        {
            SqlDataReader rdr;
          
            SqlCommand cmd = new SqlCommand(SP_SEARCHTEXT, sqlcn);
            cmd.Parameters.Add(PARAM_COL, SqlDbType.NVarChar).Value = columnName;
            cmd.Parameters.Add(PARAM_TABLE, SqlDbType.NVarChar).Value = tableName;
            cmd.Parameters.Add(PARAM_TEXT, SqlDbType.NVarChar).Value = request;
            cmd.CommandType = CommandType.StoredProcedure;
            sqlcn.Open();
            rdr = cmd.ExecuteReader();
            while (rdr.Read())
            {
                itemList.Add(rdr["C_Value"].ToString());
            }

           
        }
        catch(Exception ex)
        {
            
        }
        finally
        {
           sqlcn.Close();
        }

        return itemList;

    }
    /**Get the layer name for a particular Planning Reference. It query the layer name and returns the layername and  freetext search column names back*/
    [WebMethod]
    public static string GetLayerInfoFreeTextSearch(string value)
    {        
       
       string connectionString = ConfigurationManager.ConnectionStrings["DbTenantConnection"].ConnectionString.ToString();
       string connectionStg = ConfigurationManager.ConnectionStrings["DbConnection"].ConnectionString.ToString();
       SqlConnection sql = new SqlConnection(connectionStg);
       SqlConnection sqlcn = new SqlConnection(connectionString);      
       string tableName = ConfigurationManager.AppSettings["FreeTextTable"].ToString();
       string columnName = ConfigurationManager.AppSettings["FreeTextColumn"].ToString();
       string dbTableName = ConfigurationManager.AppSettings["PlanningAppFullName"].ToString();
	   string freeTextDBName = ConfigurationManager.AppSettings["FreeTextDatabase"].ToString();
	   
       string dbName = sql.Database;
      
      
        JavaScriptSerializer jSerializer = new JavaScriptSerializer();


       string layerName = "";

        string dbTable = dbName + ".dbo" + "[" + tableName + "]";
        try
        {
            SqlCommand cmd = new SqlCommand(SP_GetLayer, sqlcn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(PARAM_MAPNAME, SqlDbType.VarChar).Value = mapName;
            cmd.Parameters.Add(PARAM_SEARCHCOL, SqlDbType.VarChar).Value = columnName;
            cmd.Parameters.Add(PARAM_VALUE, SqlDbType.VarChar).Value = value;
            cmd.Parameters.Add(PARAM_DBTABLE, SqlDbType.NVarChar).Value = dbTableName;
			cmd.Parameters.Add(PARAM_DBNAME,SqlDbType.NVarChar).Value=freeTextDBName;
            sqlcn.Open();
            layerName = (string) cmd.ExecuteScalar();
            object obj = new { layerName = layerName, attribute = columnName };

           // return jSerializer.Serialize(obj);
           return layerName;
        }
        catch(Exception ex)
        {
            return "";
           
        }
        finally
        {
            
            sqlcn.Close();
            
        }
   

    }
    [WebMethod]
    /*Get the data to be displayed on the related applications tab. This method returns a the URL,Column names and column values */
    public static string GetRelatedTooltipInfo(string referenceId)
    {
        string connectionString = ConfigurationManager.ConnectionStrings["DbConnection"].ConnectionString.ToString();
        SqlConnection sqlconn = new SqlConnection(connectionString);
        string Url = ConfigurationManager.AppSettings["ToolTipUrl"].ToString();
       // string relatedTab = ConfigurationManager.AppSettings["RelatedTab"].ToString();
       
            List<object[]> listRelated = new List<object[]>();
            try
            {
                SqlDataReader rdr;
                var serialiazer = new JavaScriptSerializer();
                SqlCommand cmd = new SqlCommand(SP_GETRELATEDTOOLTIP, sqlconn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(PARAM_INPUTVALUE, SqlDbType.NVarChar).Value = referenceId;
                sqlconn.Open();
                rdr = cmd.ExecuteReader();
                List<string> columNames = new List<String>();
                var records = new List<object>();
                int countOfColumns = 0;

                for (int j = 0; j < rdr.FieldCount; j++)
                {
                    columNames.Add(rdr.GetName(j));
                }
                countOfColumns = columNames.Count;
                if (countOfColumns > 0)
                {                      


                    while (rdr.Read())
                    {


                        for (int i = 0; i < (countOfColumns); i++)
                        {
                            var columnname = columNames[i];
                            var readerValue = rdr[i].ToString();


                            object oObj = new
                            {
                                column = columnname,
                                Url = Url,
                                value = readerValue,
                               

                            };
                            records.Add(oObj);
                           
                        }                     


                    }
					 if(records.Count==0)
                    {
                    for (int i = 0; i < (countOfColumns); i++)
                    {
                        var columnname = columNames[i];
                        var readerValue = "";
                        object oObj = new
                        {
                            column = columnname,
                            Url = Url,
                            value = readerValue,


                        };
                        records.Add(oObj);
                    }
                    }



                }
                var returnResult = serialiazer.Serialize(records);
                return returnResult;
            }
            catch (Exception ex)
            {

                return "";
            }
            finally
            {
                sqlconn.Close();
            }
    
   
}

//protected void freetxtBtn_Click(object sender, EventArgs e)
//{
//  // GetLayerInfoFreeTextSearch(Request.Form["freetext"]);
//}
}




