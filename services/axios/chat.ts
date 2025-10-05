import { create } from "zustand";
import { ApiClientSingleton } from "./conf";
import { socketService } from "../socketService";
import {
  UserData,
  Chat,
  LastMessage,
  Message,
  MessageContent,
  MessageStatus,
  SendMessageParams,
} from "@/types";
import useGlobalStore from "@/store/globalStore";
