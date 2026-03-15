import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bkt-pgd", element: <ListPage /> },
  { path: "/bkt-pgd/new", element: <FormPage /> },
  { path: "/bkt-pgd/edit/:id", element: <FormPage isEdit /> },
  { path: "/bkt-pgd/:id", element: <DetailPage /> },
];
