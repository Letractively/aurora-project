package navigator;

import helpers.ApplicationException;
import helpers.AuroraConstant;

import org.eclipse.core.resources.IFile;
import org.eclipse.jface.viewers.Viewer;
import org.eclipse.jface.viewers.ViewerFilter;


public class BMFileFilter extends ViewerFilter{

	public boolean select(Viewer viewer, Object parentElement, Object element) {
		if(element instanceof BMFile){
			return true;
		}
		if(element instanceof IFile){
			IFile file = (IFile)element;
			if(file.getName().toLowerCase().endsWith("."+AuroraConstant.BMFileExtension)){
				String extendValue = null;
				try {
					extendValue = BMHierarchyCache.getInstance().getExtendValue(file);
				} catch (ApplicationException e) {
//					CustomDialog.showErrorMessageBox(e);
				}
				if(extendValue !=null){
//					TreePath parentPath = (TreePath)parentElement;
//					if(parentPath != null){
//						if(parentPath.getLastSegment() != null && parentPath.getLastSegment() instanceof BMFile)
//							return true;
//					}
					return false;
				}
			}
		}
		return true;
	}

}
