package aurora.ide.meta.gef.editors.models.io;

import java.util.List;

import uncertain.composite.CompositeMap;
import aurora.ide.api.composite.map.CommentCompositeMap;
import aurora.ide.meta.gef.editors.models.AuroraComponent;
import aurora.ide.meta.gef.editors.models.ModelQuery;
import aurora.ide.meta.gef.editors.models.link.Parameter;
import aurora.ide.meta.gef.editors.models.link.TabRef;

public class TabRefHandler extends DefaultIOHandler {
	public static final String URL = "url";
	public static final String TABITEM = "tabitem";

	@Override
	protected AuroraComponent getNewObject(CompositeMap map) {
		return new TabRef();
	}

	@Override
	protected void storeSimpleAttribute(CompositeMap map, AuroraComponent ac) {
		super.storeSimpleAttribute(map, ac);
		TabRef ref = (TabRef) ac;
		map.put(URL, ref.getOpenPath());
	}

	@Override
	protected void storeComplexAttribute(CompositeMap map, AuroraComponent ac) {
		super.storeComplexAttribute(map, ac);
		TabRef ref = (TabRef) ac;
		ModelQuery im = ref.getModelQuery();
		if (im != null) {
			ReferenceHandler rh = new ReferenceHandler();
			CompositeMap imMap = rh.toCompositeMap(im, mic);
			imMap.put(ReferenceHandler.COMMENT,
					ModelQuery.class.getSimpleName());
			map.addChild(imMap);
		}
		map.addChild(getParameterMap(ref, mic));
	}

	private CompositeMap getParameterMap(TabRef ref, ModelIOContext mic) {
		CompositeMap pMap = new CommentCompositeMap(RendererHandler.PARAMETERS);
		ParameterHandler ph = new ParameterHandler();
		for (Parameter p : ref.getParameters()) {
			pMap.addChild(ph.toCompositeMap(p, mic));
		}
		return pMap;
	}

	@Override
	protected void restoreSimpleAttribute(AuroraComponent ac, CompositeMap map) {
		super.restoreSimpleAttribute(ac, map);
		TabRef ref = (TabRef) ac;
		ref.setOpenPath(map.getString(URL));
	}

	@Override
	protected void restoreComplexAttribute(AuroraComponent ac, CompositeMap map) {
		super.restoreComplexAttribute(ac, map);
		TabRef ref = (TabRef) ac;
		CompositeMap m = getMap(map, ReferenceHandler.NS_PREFIX,
				ReferenceHandler.COMMENT, ModelQuery.class.getSimpleName());
		if (m != null) {
			String mid = m.getString(ReferenceHandler.REF_ID);
			ModelQuery im = (ModelQuery) mic.markMap.get(mid);
			if (im != null) {
				ref.setModelQuery(im);
			} else {
				// this may not happen,because initmodels are always create
				// before tabref.
				ReferenceDecl rd = new ReferenceDecl(mid, ref, "setModelQuery",
						ModelQuery.class);
				mic.refDeclList.add(rd);
			}
		}
		restoreParameters(ref, map, mic);
	}

	private void restoreParameters(TabRef ref, CompositeMap map,
			ModelIOContext mic) {
		CompositeMap psMap = map.getChild(RendererHandler.PARAMETERS);
		if (psMap == null)
			return;
		ParameterHandler ph = new ParameterHandler();
		@SuppressWarnings("unchecked")
		List<CompositeMap> list = psMap.getChildsNotNull();
		for (CompositeMap m : list) {
			Parameter p = (Parameter) ph.fromCompositeMap(m, mic);
			ref.addParameter(p);
		}
	}
}
