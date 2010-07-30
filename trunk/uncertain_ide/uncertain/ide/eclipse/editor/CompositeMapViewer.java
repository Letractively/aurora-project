/**
 * 
 */
package uncertain.ide.eclipse.editor;

import org.eclipse.swt.SWT;

import uncertain.composite.CompositeMap;
import uncertain.ide.LoadSchemaManager;
import uncertain.ide.LocaleMessage;
import uncertain.ide.eclipse.action.CompositeMapAction;
import uncertain.ide.eclipse.editor.widgets.CustomDialog;
import uncertain.schema.Element;

public abstract class CompositeMapViewer implements IViewer{
	
	protected CompositeMap mSelectedData;
	protected CompositeMap mFocusData;
	
	public void copyElement() {
		CompositeMap child = new CompositeMap(getFocus());
		child.setParent(getFocus().getParent());
		setSelection(child);
	}
	
	
	public void pasteElement() {
		CompositeMap selectedCm = getSelection();
		if (selectedCm == null)
			return;
		CompositeMap parentComp = getFocus();
		if (!CompositeMapAction.validNextNodeLegalWithAction(parentComp, selectedCm)) {
			return;
		}
		CompositeMap child = new CompositeMap(selectedCm);
		if (child != null) {
			parentComp.addChild(child);
			selectedCm.getParent().removeChild(selectedCm);
			CompositeMapAction.addArrayNode(parentComp);
		}
		selectedCm = null;
		refresh(true);
	}



	public void cutElement() {
		setSelection(getFocus());
	}

	public void removeElement() {
		CompositeMap comp = getFocus();
		if (comp != null) {
			Element em = LoadSchemaManager.getSchemaManager().getElement(comp);
			if (em != null && em.isArray()) {
				if (comp.getChildsNotNull().size() > 0) {
					int buttonID = CustomDialog.showConfirmDialogBox(null,
							LocaleMessage.getString("clear.array.question"));
					switch (buttonID) {
					case SWT.OK:
						if (comp != null) {
							comp.getChildsNotNull().clear();
							refresh(true);
							return;
						}
						refresh(true);
					case SWT.CANCEL:
						return;
					}
				}
				CustomDialog.showWarningMessageBox(null, LocaleMessage.getString("can.not.delete.array.hint"));
				return;
			}
		}
		int buttonID = CustomDialog.showConfirmDialogBox(null, LocaleMessage.getString("delete.element.confirm"));
		switch (buttonID) {
		case SWT.OK:
			if (comp != null) {
				CompositeMap parentCM = comp.getParent();
				Element element = LoadSchemaManager.getSchemaManager().getElement(
						parentCM);
				if (element.isArray()) {
					comp.getParent().removeChild(comp);
					if (parentCM.getChilds() == null
							|| parentCM.getChilds().size() == 0) {
						parentCM.getParent().removeChild(parentCM);
					}
				} else {
					comp.getParent().removeChild(comp);
				}
			}
			refresh(true);
		case SWT.CANCEL:
			break;
		}
	}
	
	
	
	
	public CompositeMap getSelection(){
		return mSelectedData;
	}
	public void setSelection(CompositeMap data){
		mSelectedData = data;
	}
	public void setFocus(CompositeMap data){
		mFocusData = data;
	}
	public CompositeMap getFocus(){
		return mFocusData;
	}
	public abstract CompositeMap getInput();
}
