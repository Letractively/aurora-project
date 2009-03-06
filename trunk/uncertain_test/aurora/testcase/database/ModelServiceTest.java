/*
 * Created on 2008-5-8
 */
package aurora.testcase.database;

import java.io.PrintWriter;
import java.sql.Connection;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import junit.framework.TestCase;
import uncertain.composite.CompositeMap;
import uncertain.composite.DynamicObject;
import uncertain.core.UncertainEngine;
import uncertain.event.Configuration;
import aurora.database.FetchDescriptor;
import aurora.database.service.BusinessModelService;
import aurora.database.service.BusinessModelServiceContext;
import aurora.database.service.DatabaseServiceFactory;
import aurora.service.json.JSONDirectOutputor;

public class ModelServiceTest extends TestCase {
    
    ConnectionProvider  cp;
    Connection          conn;
    
    UncertainEngine         uncertainEngine;
    //ModelFactory            modelFactory;
    //DefaultDatabaseProfile  profile;
    //SqlBuilderRegistry      builder_reg;
    
    DatabaseServiceFactory  svcFactory;


    /**
     * @param arg0
     */
    public ModelServiceTest(String arg0) {
        super(arg0);
      
    }
    
    /* (non-Javadoc)
     * @see junit.framework.TestCase#setUp()
     */
    protected void setUp() throws Exception {
        super.setUp();
        cp = new ConnectionProvider();
        conn = cp.getConnection();
        
        uncertainEngine = new UncertainEngine();
        uncertainEngine.initialize(new CompositeMap());
/*
        modelFactory = new ModelFactory(uncertainEngine);
        profile = new DefaultDatabaseProfile("SQL92");
        builder_reg = new SqlBuilderRegistry(profile);
*/        
        
        svcFactory = new DatabaseServiceFactory(uncertainEngine);
    }

    protected void tearDown() throws Exception {
        super.tearDown();
        if(conn!=null)
            conn.close();
    }

/*
    public void testQuery()
        throws Throwable
    {
        BusinessModelService service = svcFactory.getService("testcase.HR.EMP");
        service.setConnection(conn);
        Map parameters = new HashMap();
        parameters.put("EMPNO", "1121");
        CompositeMap result =  service.queryAsMap(parameters, FetchDescriptor.createInstance(0, 5));
        assertNotNull(result);
        System.out.println(result.toXML());
    }
*/    
    public void testUpdateAndQuery()
        throws Throwable
    {
        Configuration rootConfig = uncertainEngine.createConfig();
        rootConfig.addParticipant(this);
        CompositeMap  context = new CompositeMap("root");        
        BusinessModelServiceContext bc = (BusinessModelServiceContext)DynamicObject.cast(context, BusinessModelServiceContext.class);
        bc.setConfig(rootConfig);
        bc.setConnection(conn);
        bc.setTrace(true);
        
        long time = System.currentTimeMillis();
        BusinessModelService service = svcFactory.getModelService("testcase.HR.EMP", context);
        time = System.currentTimeMillis() - time;
        System.out.println("[load time] "+time);
        

        //service.getServiceContext().setConnection(conn);
        //service.getServiceContext().setTrace(true);
        Map parameters = new HashMap();
        Long id = new Long("7499");
        String new_name = "ALLEN Updated";
        parameters.put("empno", id);
        parameters.put("ename", new_name);
        parameters.put("deptno", new Long(20));
        parameters.put("mgr", new Long(7839));
        parameters.put("hiredate", new java.sql.Date( new Date().getTime()));
        service.updateByPK(parameters);
        assertNotNull(context.get("update_invoked"));
        assertEquals(bc.getConfig(), rootConfig);
        conn.commit();
        
        parameters.clear();
        parameters.put("deptno", new Long(20));
        parameters.put("mgr", new Long(2222));
        parameters.put("mgr_name", "JONES");
        FetchDescriptor desc = FetchDescriptor.createInstance(0, 50);
        CompositeMap result =  service.queryAsMap(parameters, desc );
        assertNotNull(result);
        Iterator it = result.getChildIterator();
        assertNotNull(it);
        CompositeMap record = null;
        while(it.hasNext()){
            record = (CompositeMap)it.next();
            if(id.equals(record.getLong("empno")))
                break;
            else
                record = null;
        }
        assertNotNull(record);
        assertEquals(new_name, record.getString("ename"));
        System.out.println(result.toXML());
       
        JSONDirectOutputor consumer = new JSONDirectOutputor( new PrintWriter(System.out));
        service.query(parameters, consumer, desc);

        //System.out.println(context.toXML());
    }
    
    public void onExecuteUpdate( BusinessModelServiceContext context ){
        //System.out.println("Updated!");
        context.putBoolean("update_invoked", true);
    }


}
