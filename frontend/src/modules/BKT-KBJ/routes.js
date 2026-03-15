import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bkt-kbj", element: <ListPage /> },
  { path: "/bkt-kbj/new", element: <FormPage /> },
  { path: "/bkt-kbj/edit/:id", element: <FormPage isEdit /> },
  { path: "/bkt-kbj/:id", element: <DetailPage /> },
];
