package aurora.ide.screen.editor;


import org.eclipse.ui.PartInitException;

import aurora.ide.editor.CompositeMapTreeEditor;
import aurora.ide.editor.CompositeMapTreePage;
import aurora.ide.helpers.DialogUtil;


public class ServiceEditor extends CompositeMapTreeEditor{


	protected int browserPageIndex;
	private BrowserPage browsePage;
	public CompositeMapTreePage initTreePage() {
		ServiceTreePage treePage = new ServiceTreePage(this);
		return treePage;
	}
	
	protected void addPages() {
		browsePage = new BrowserPage(this);
		try {
			super.addPages();
			browserPageIndex=addPage(browsePage);
		} catch (PartInitException e) {
			DialogUtil.showExceptionMessageBox(e);
		}
	}
	protected void pageChange(int newPageIndex){
		if(newPageIndex == browserPageIndex){
			browsePage.refresh();
		}
		super.pageChange(newPageIndex);
	}
	public void editorDirtyStateChanged() {
		super.editorDirtyStateChanged();
		browsePage.setModify(true);
	}
}