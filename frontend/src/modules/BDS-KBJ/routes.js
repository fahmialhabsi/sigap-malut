import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bds-kbj", element: <ListPage /> },
  { path: "/bds-kbj/new", element: <FormPage /> },
  { path: "/bds-kbj/edit/:id", element: <FormPage isEdit /> },
  { path: "/bds-kbj/:id", element: <DetailPage /> },
];
