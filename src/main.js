import * as dom from "./dom.js";
import * as fileList from "./fileList.js";
import * as convert from "./convert.js";
import { renderFileList } from "./ui.js";

// UIを更新する
function updateUI() {
  const currentList = fileList.getFileList();

  if (currentList.length === 0) {
    dom.emptyMessage.classList.remove("hidden");
    dom.listContainer.classList.add("hidden");
  } else {
    dom.emptyMessage.classList.add("hidden");
    dom.listContainer.classList.remove("hidden");

    renderFileList(dom.listContainer, currentList);
  }
}
