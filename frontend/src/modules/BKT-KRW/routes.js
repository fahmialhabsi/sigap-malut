import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bkt-krw", element: <ListPage /> },
  { path: "/bkt-krw/new", element: <FormPage /> },
  { path: "/bkt-krw/edit/:id", element: <FormPage isEdit /> },
  { path: "/bkt-krw/:id", element: <DetailPage /> },
];
