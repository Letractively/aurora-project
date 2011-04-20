package aurora.datasource;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Enumeration;
import java.util.Properties;

import uncertain.composite.CompositeMap;

public class DatabaseConnection{
	String name;
	String driverClass;
	String url;
	String userName;
	String password;	
	boolean pool=true;	
	CompositeMap config=null;	

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getDriverClass() {
		return driverClass;
	}
	public void setDriverClass(String driverClass) {
		this.driverClass = driverClass;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public boolean getPool() {
		return pool;
	}
	public void setPool(boolean pool) {
		this.pool = pool;
	}	
	
	public void addProperties(CompositeMap config){
		String key;
		String text=config.getText();		
		Properties properties=new Properties();			
		try {		
			ByteArrayInputStream stream = new ByteArrayInputStream(text.getBytes("UTF-8"));			
			properties.load(stream);
		} catch (IOException e) {		
			e.printStackTrace();
		}
		Enumeration enum=properties.propertyNames();
		if(enum!=null){
			this.config=new CompositeMap();	
			while (enum.hasMoreElements()) {
				key = (String) enum.nextElement();
				this.config.put(key, properties.getProperty(key).trim());
			}
		}
	}
}
