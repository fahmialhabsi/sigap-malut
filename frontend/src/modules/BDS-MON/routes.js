import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bds-mon", element: <ListPage /> },
  { path: "/bds-mon/new", element: <FormPage /> },
  { path: "/bds-mon/edit/:id", element: <FormPage isEdit /> },
  { path: "/bds-mon/:id", element: <DetailPage /> },
];
