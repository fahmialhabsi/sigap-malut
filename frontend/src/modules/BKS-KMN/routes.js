import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bks-kmn", element: <ListPage /> },
  { path: "/bks-kmn/new", element: <FormPage /> },
  { path: "/bks-kmn/edit/:id", element: <FormPage isEdit /> },
  { path: "/bks-kmn/:id", element: <DetailPage /> },
];
