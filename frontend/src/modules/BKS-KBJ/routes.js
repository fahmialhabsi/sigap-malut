import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bks-kbj", element: <ListPage /> },
  { path: "/bks-kbj/new", element: <FormPage /> },
  { path: "/bks-kbj/edit/:id", element: <FormPage isEdit /> },
  { path: "/bks-kbj/:id", element: <DetailPage /> },
];
