import { objMap } from "genshin-optimizer/util";
import { Box, Divider, ListItem } from "@mui/material";
import { useContext, useMemo } from "react";
import { DataContext } from "../../../../contexts/DataContext";
import { OptimizationTargetContext } from "../../../../contexts/OptimizationTargetContext";
import { useDatabase } from "genshin-optimizer/db-ui";
import {
  getDisplayHeader,
  getDisplaySections,
} from "../../Formula/DisplayUtil";
import type { DisplaySub } from "../../Formula/type";
import type { NodeDisplay } from "../../Formula/uiData";
import { customRead } from "../../Formula/utils";
import CardDark from "../Card/CardDark";
import CardHeaderCustom from "../Card/CardHeaderCustom";
import { FieldDisplayList, NodeFieldDisplay } from "../FieldDisplay";
import ImgIcon from "../Image/ImgIcon";
import { SqBadge } from "genshin-optimizer/ui";

export default function StatDisplayComponent() {
  const { data } = useContext(DataContext);
  const sections = useMemo(
    () =>
      getDisplaySections(data).filter(([, ns]) =>
        Object.values(ns).some((n) => !n.isEmpty)
      ),
    [data]
  );
  return (
    <Box sx={{ mr: -1, mb: -1 }}>
      <div >
        {sections.map(([key, Nodes]) => (
          <Section key={key} displayNs={Nodes} sectionKey={key} />
        ))}
      </div>
    </Box>
  );
}

function Section({
  displayNs,
  sectionKey,
}: {
  displayNs: DisplaySub<NodeDisplay>;
  sectionKey: string;
}) {
  const optimizationTarget = useContext(OptimizationTargetContext);
  const { data, oldData } = useContext(DataContext);
  const database = useDatabase();
  const header = useMemo(
    () => getDisplayHeader(data, sectionKey, database),
    [database, data, sectionKey]
  );
  const displayNsReads = useMemo(
    () =>
      objMap(displayNs, (_n, nodeKey) =>
        customRead(["display", sectionKey, nodeKey])
      ),
    [displayNs, sectionKey]
  );
  if (!header) return <CardDark></CardDark>;

  const { title, icon, action } = header;
  return (
    <CardDark>
      <CardHeaderCustom
        avatar={icon && <ImgIcon size={2} src={icon} />}
        title={title}
        action={action && <SqBadge>{action}</SqBadge>}
      />
      <Divider />
      <FieldDisplayList sx={{ m: 0 }}>
        {Object.entries(displayNs).map(([nodeKey, n]) => (
          <NodeFieldDisplay
            key={nodeKey}
            node={n}
            oldValue={
              oldData ? oldData.get(displayNsReads[nodeKey]!).value : undefined
            }
            component={ListItem}
            emphasize={
              JSON.stringify(optimizationTarget) ===
              JSON.stringify([sectionKey, nodeKey])
            }
          />
        ))}
      </FieldDisplayList>
    </CardDark>
  );
}
