import * as typedb from './database';
import * as scriptfiles from './as_parser';

import { Range, Position, Location, SemanticTokens, SemanticTokensBuilder } from "vscode-languageserver";

export let SemanticTypes : any = {};
export let SemanticTypeList : Array<string> = [
	"namespace", "template_base_type", "parameter",
	"local_variable", "member_variable", "member_accessor", "global_variable",
	"global_accessor", "member_function", "global_function", "unknown_error",
    "typename", "typename_actor", "typename_component", "typename_struct", "typename_event",
    "typename_delegate", "typename_primitive",
];

for (let i = 0, Count = SemanticTypeList.length; i < Count; ++i)
	SemanticTypes[SemanticTypeList[i]] = i;

export function HighlightSymbols(asmodule : scriptfiles.ASModule) : SemanticTokens
{
    let builder = new SemanticTokensBuilder();

	for (let symbol of asmodule.symbols)
	{
		let pos = asmodule.getPosition(symbol.start);
		let length = symbol.end - symbol.start;

		let type = -1;
        if (symbol.type == scriptfiles.ASSymbolType.Typename)
        {
            let dbtype = typedb.GetType(symbol.symbol_name);
            let classification = typedb.DBTypeClassification.Other;
            if (dbtype)
                classification = dbtype.getTypeClassification();
            else if (symbol.symbol_name == "auto")
                classification = typedb.DBTypeClassification.Primitive;

            switch (classification)
            {
                case typedb.DBTypeClassification.Component:
                    type = SemanticTypes.typename_component;
                break;
                case typedb.DBTypeClassification.Actor:
                    type = SemanticTypes.typename_actor;
                break;
                case typedb.DBTypeClassification.Struct:
                    type = SemanticTypes.typename_struct;
                break;
                case typedb.DBTypeClassification.Event:
                    type = SemanticTypes.typename_event;
                break;
                case typedb.DBTypeClassification.Delegate:
                    type = SemanticTypes.typename_delegate;
                break;
                case typedb.DBTypeClassification.Primitive:
                    type = SemanticTypes.typename_primitive;
                break;
                case typedb.DBTypeClassification.Other:
                default:
                    type = SemanticTypes.typename;
                break;
            }
        }
		else switch (symbol.type)
		{
			case scriptfiles.ASSymbolType.UnknownError:
				type = SemanticTypes.unknown_error;
			break;
			case scriptfiles.ASSymbolType.Namespace:
				type = SemanticTypes.namespace;
			break;
			case scriptfiles.ASSymbolType.TemplateBaseType:
				type = SemanticTypes.templae_base_type;
			break;
			case scriptfiles.ASSymbolType.Parameter:
				type = SemanticTypes.parameter;
			break;
			case scriptfiles.ASSymbolType.LocalVariable:
				type = SemanticTypes.local_variable;
			break;
			case scriptfiles.ASSymbolType.MemberVariable:
				type = SemanticTypes.member_variable;
			break;
			case scriptfiles.ASSymbolType.MemberAccessor:
				type = SemanticTypes.member_accessor;
			break;
			case scriptfiles.ASSymbolType.GlobalVariable:
				type = SemanticTypes.global_variable;
			break;
			case scriptfiles.ASSymbolType.GlobalAccessor:
				type = SemanticTypes.global_accessor;
			break;
			case scriptfiles.ASSymbolType.MemberFunction:
				type = SemanticTypes.member_function;
			break;
			case scriptfiles.ASSymbolType.GlobalFunction:
				type = SemanticTypes.global_function;
			break;
		}

		if (type == -1)
			continue;

		let modifiers = 0;
		builder.push(pos.line, pos.character, length, type, modifiers);
	}

    return builder.build();
}