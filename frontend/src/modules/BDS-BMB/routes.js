import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bds-bmb", element: <ListPage /> },
  { path: "/bds-bmb/new", element: <FormPage /> },
  { path: "/bds-bmb/edit/:id", element: <FormPage isEdit /> },
  { path: "/bds-bmb/:id", element: <DetailPage /> },
];
