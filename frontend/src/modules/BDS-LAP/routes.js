import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bds-lap", element: <ListPage /> },
  { path: "/bds-lap/new", element: <FormPage /> },
  { path: "/bds-lap/edit/:id", element: <FormPage isEdit /> },
  { path: "/bds-lap/:id", element: <DetailPage /> },
];
