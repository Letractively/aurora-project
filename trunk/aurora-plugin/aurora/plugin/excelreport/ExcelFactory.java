package aurora.plugin.excelreport;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import uncertain.composite.CompositeMap;

public class ExcelFactory {
	Map<String, CellStyle> styles;
	public final String KEY_CONTENT = "content";
	public final String KEY_FORMULA = "formula";
	private CreationHelper createHelper;

	public void createExcel(CompositeMap context, ExcelReport excelReport)
			throws Exception {
		if(excelReport.getSheets()==null)return;	
		Workbook wb = null;
		if (ExcelReport.KEY_EXCEL2007_SUFFIX.equalsIgnoreCase(excelReport.getFormat()))
			wb = new XSSFWorkbook();
		else
			wb = new HSSFWorkbook();	
		createHelper=wb.getCreationHelper();
		if(excelReport.getStyles()!=null)
			styles = createStyles(wb, excelReport);
		for (SheetWrap sheetObj : excelReport.getSheets()) {
			sheetObj.createSheet(wb, context, this);
		}
		wb.write(excelReport.getOutputStream());		
		excelReport.getOutputStream().close();
	}

	private Map<String, CellStyle> createStyles(Workbook wb,
			ExcelReport excelReport) {		
		Map<String, CellStyle> styles = new HashMap<String, CellStyle>();
		CellStyle style;		
		for (CellStyleWrap cellStyleObj : excelReport.getStyles()) {
			style = cellStyleObj.createStyle(wb);
			styles.put(cellStyleObj.getName(), style);
		}
		return styles;
	}

	public static Row createRow(Sheet sheet, int rownum) {
		Row row = sheet.getRow(rownum - 1);
		if (row == null)
			row = sheet.createRow(rownum - 1);
		return row;
	}
	
	public static boolean isNotNull(Object value) {
		if (value != null&&!"".equals(value))
			return true;
		else
			return false;
	}
	
	public CellStyle getStyle(String styleName){		
		if(this.styles!=null){
			CellStyle style=this.styles.get(styleName);
			return style;
		}else{
			return null;
		}
	}
	
	public CreationHelper getCreateHelper(){
		return this.createHelper;
	}
	
	public void setCellValue(Cell cell, Object value){
		setCellValue(cell,value,null);
	}

	public void setCellValue(Cell cell, Object value,String dataType) {
		if (value == null)
			return;
		if(ExcelFactory.isNotNull(dataType)){			
			if (CellData.KEY_DATA_TYPE_STRING.equals(dataType))
				cell.setCellValue(getCreateHelper().createRichTextString(value.toString()));
			if (CellData.KEY_DATA_TYPE_NUMBER.equals(dataType))
				cell.setCellValue(Double.valueOf(value.toString()).doubleValue());
			else
				cell.setCellValue(getCreateHelper().createRichTextString(value.toString()));
		}else{
			if (value instanceof String) {
				cell.setCellValue(getCreateHelper().createRichTextString((String) value));
				return;
			}
			if (value instanceof Number) {
				cell.setCellValue(Double.parseDouble(value.toString()));
				return;
			}
			if (value instanceof Date) {
				cell.setCellValue((Date) value);
				return;
			} else {
				cell.setCellValue(value.toString());
				return;
			}
		}
	}
}
