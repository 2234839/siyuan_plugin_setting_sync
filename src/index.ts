import { Plugin } from "siyuan";
import "./index.css";

export default class Setting_sync extends Plugin {
  async onload() {
    this.eventBus.on("sync-end", async () => {
      type layouts = {
        layout: any;
        name: string;
        time: number;
      }[];
      const localLayout: layouts = window.siyuan.storage["local-layouts"];
      const localLayoutSync: layouts = (await this.loadData("local-layouts")) || [];

      if (JSON.stringify(localLayout) === JSON.stringify(localLayoutSync)) {
        console.log("布局无变化");
        return;
      }

      const localLayoutLastTime = localLayout.reduce(
        (max, { time }) => (time > max ? time : max),
        0,
      );
      const localLayoutSyncLastTime = localLayoutSync.reduce(
        (max, { time }) => (time > max ? time : max),
        0,
      );

      if (localLayoutSyncLastTime > localLayoutLastTime) {
        console.log("更新本地布局");

        fetch("/api/storage/setLocalStorageVal", {
          referrerPolicy: "strict-origin-when-cross-origin",
          body: JSON.stringify({ app: "Setting_sync", key: "local-layouts", val: localLayoutSync }),
          method: "POST",
          mode: "cors",
          credentials: "include",
        });
      } else {
        console.log("保存本地布局");
        this.saveData("local-layouts", localLayout);
      }
      fetch("/api/sync/performSync", {
        body: "{}",
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
    });
  }

  /** 插件卸载时会执行此数组中的函数 */
  onunloadFn = [] as (() => void)[];
  async onunload() {
    this.onunloadFn.forEach((fn) => fn());
  }
}
